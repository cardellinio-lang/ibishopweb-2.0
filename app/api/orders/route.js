import { randomBytes } from 'crypto';
import prisma from '@/lib/db';
import { sendAdminNotification } from '@/lib/telegram';
import { sendCapiEvents } from '@/lib/facebook-capi';
import { waitUntil } from '@vercel/functions';

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, include: { items: true },
  });
  const enriched = await Promise.all(orders.map(async o => {
    const wilaya = await prisma.wilaya.findUnique({ where: { id: o.wilayaId } });
    const commune = await prisma.commune.findUnique({ where: { id: o.communeId } });
    return { ...o, wilayaName: wilaya?.name || '', communeName: commune?.name || '' };
  }));
  return Response.json(enriched);
}

export async function POST(req) {
  const data = await req.json();
  // Backup log dans Vercel (visible dans les logs functions)
  console.log('[ORDER-BACKUP]', JSON.stringify({ ...data, _time: new Date().toISOString() }));
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  // Vérification doublon : même téléphone + même produit aujourd'hui
  const todayStart = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' }) + 'T00:00:00+01:00');
  const duplicate = await prisma.order.findFirst({
    where: {
      phone: data.phone,
      createdAt: { gte: todayStart },
      items: { some: { productId: data.productId } },
    },
  });
  if (duplicate) {
    return Response.json(
      { error: 'لقد قمت بطلب نفس المنتج منذ لحظات سنتصل بك لتأكيد الطلبية' },
      { status: 409 }
    );
  }

  if (product.stock < data.qty) return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  const wilaya = await prisma.wilaya.findUnique({ where: { id: data.wilayaId } });
  if (!wilaya) return Response.json({ error: 'Wilaya invalide' }, { status: 400 });

  const deliveryPrice = data.deliveryType === 'office' ? wilaya.priceOffice : wilaya.price;
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
