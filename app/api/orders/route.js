import { randomBytes } from 'crypto';
import prisma, { withDbRetry } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { sendAdminNotification } from '@/lib/telegram';
import { sendCapiEvents } from '@/lib/facebook-capi';
import { waitUntil } from '@vercel/functions';

// Réservé à l'admin : sans cette authentification, n'importe qui pouvait lire
// toutes les commandes (noms, téléphones, adresses, token de confirmation).
export async function GET(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const orders = await withDbRetry(() => prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, include: { items: true },
  }));
  const [wilayas, communes] = await Promise.all([
    withDbRetry(() => prisma.wilaya.findMany({ select: { id: true, name: true } })),
    withDbRetry(() => prisma.commune.findMany({ select: { id: true, name: true } })),
  ]);
  const wMap = new Map(wilayas.map(w => [w.id, w.name]));
  const cMap = new Map(communes.map(c => [c.id, c.name]));
  const enriched = orders.map(o => ({
    ...o,
    wilayaName: wMap.get(o.wilayaId) || '',
    communeName: cMap.get(o.communeId) || '',
  }));
  return Response.json(enriched);
}

export async function POST(req) {
  const data = await req.json();
  // Backup log dans Vercel (visible dans les logs functions)
  console.log('[ORDER-BACKUP]', JSON.stringify({ ...data, _time: new Date().toISOString() }));
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  // Vérification : si ce téléphone a 5+ commandes de ce produit → bloqué
  const abuseCount = await prisma.order.count({
    where: {
      phone: data.phone,
      items: { some: { productId: data.productId } },
    },
  });
  if (abuseCount >= 5) {
    return Response.json(
      { error: 'عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى' },
      { status: 409 }
    );
  }

  if (product.stock < data.qty) return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  const wilaya = await prisma.wilaya.findUnique({ where: { id: data.wilayaId } });
  if (!wilaya) return Response.json({ error: 'Wilaya invalide' }, { status: 400 });

  // tbl-disjon : livraison gratuite au bureau de retrait, 400 DA à domicile
  const deliveryPrice = product.slug === 'tbl-disjon'
    ? (data.deliveryType === 'office' ? 0 : 400)
    : (data.deliveryType === 'office' ? wilaya.priceOffice : wilaya.price);
  const total = product.price * data.qty + deliveryPrice;

  const itemName = data.variantName || product.name;
  const itemPrice = data.variantPrice || product.price;
  const orderTotal = itemPrice * data.qty + deliveryPrice;

  const order = await prisma.order.create({
    data: {
      number: 'CMD-' + Date.now().toString(36).toUpperCase(),
      customer: data.customer,
      phone: data.phone,
      token: randomBytes(12).toString('hex'),
      wilayaId: data.wilayaId,
      communeId: data.communeId,
      address: data.address,
      total: orderTotal,
      delivery: deliveryPrice,
      deliveryType: data.deliveryType || 'home',
      status: 'pending',
      items: {
        create: { productId: product.id, name: itemName, price: itemPrice, quantity: data.qty },
      },
    },
  });

  await prisma.product.update({ where: { id: product.id }, data: { stock: product.stock - data.qty } });

  // Fire CAPI Purchase (same event_id as browser → Meta deduplicates → 100% coverage)
  const capiEventId = `order_${order.id}`;
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_CAPI_ACCESS_TOKEN;
  if (pixelId && accessToken) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const ua = req.headers.get('user-agent') || '';
    waitUntil(sendCapiEvents([{
      event_name: 'Purchase',
      event_id: capiEventId,
      event_source_url: data.pageUrl || '',
      phone: data.phone || '',
      ip,
      ua,
      value: orderTotal,
      content_ids: [product.id],
      num_items: data.qty,
    }], pixelId, accessToken));
  }

  // Telegram notification
  const commune = await prisma.commune.findUnique({ where: { id: data.communeId } });
  waitUntil(sendAdminNotification({
    product: itemName, qty: data.qty, price: itemPrice,
    customer: data.customer, phone: data.phone,
    wilaya: wilaya.name, commune: commune?.name || '',
    address: data.address,
    deliveryType: data.deliveryType || 'home',
    deliveryPrice,
    total: orderTotal,
  }));

  const sheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (sheetUrl) {
    try {
      const commune = await prisma.commune.findUnique({ where: { id: data.communeId } });
      fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: order.number, customer: data.customer, phone: data.phone,
          wilaya: wilaya.name, commune: commune?.name || '', address: data.address,
          product: product.name, quantity: data.qty, price: product.price,
          delivery: deliveryPrice, total, status: 'pending',
          date: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}
  }

  return Response.json({ ...order, capiEventId }, { status: 201 });
}
