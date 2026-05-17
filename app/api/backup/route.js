import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, include: { items: true },
  });
  const enriched = await Promise.all(orders.map(async o => {
    const wilaya = await prisma.wilaya.findUnique({ where: { id: o.wilayaId } });
    const commune = await prisma.commune.findUnique({ where: { id: o.communeId } });
    return { ...o, wilayaName: wilaya?.name || '', communeName: commune?.name || '' };
  }));
  const csv = [
    ['Commande', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Adresse', 'Produit', 'Prix', 'Qté', 'Livraison', 'Total', 'Statut', 'Date'].join(','),
    ...enriched.map(o => [
      o.number, `"${o.customer}"`, o.phone, o.wilayaName, o.communeName, `"${o.address || ''}"`,
      `"${o.items[0]?.name || ''}"`, o.items[0]?.price || 0, o.items.reduce((s, i) => s + i.quantity, 0),
      o.delivery, o.total, o.status, new Date(o.createdAt).toISOString(),
    ].join(',')),
  ].join('\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="commandes.csv"' },
  });
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return Response.json({ error: 'Produit introuvable' }, { status: 400 });
  const wilaya = await prisma.wilaya.findUnique({ where: { id: data.wilayaId } });
  if (!wilaya) return Response.json({ error: 'Wilaya invalide' }, { status: 400 });
  const commune = await prisma.commune.findUnique({ where: { id: data.communeId } });
  const deliveryPrice = data.deliveryType === 'office' ? wilaya.priceOffice : wilaya.price;
  const total = product.price * data.qty + deliveryPrice;
  const order = await prisma.order.create({
    data: {
      number: 'CMD-' + Date.now().toString(36).toUpperCase(),
      customer: data.customer,
      phone: data.phone,
      wilayaId: data.wilayaId,
      communeId: data.communeId,
      address: data.address || '',
      total,
      delivery: deliveryPrice,
      deliveryType: data.deliveryType || 'home',
      status: 'pending',
      items: { create: { productId: product.id, name: product.name, price: product.price, quantity: data.qty } },
    },
  });
  await prisma.product.update({ where: { id: product.id }, data: { stock: product.stock - data.qty } });
  return Response.json(order, { status: 201 });
}
