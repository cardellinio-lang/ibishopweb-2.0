import prisma from '@/lib/db';

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
  return Response.json(orders);
}

export async function POST(req) {
  const data = await req.json();
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.stock < data.qty) return Response.json({ error: 'Stock insuffisant' }, { status: 400 });

  const wilaya = await prisma.wilaya.findUnique({ where: { id: data.wilayaId } });
  if (!wilaya) return Response.json({ error: 'Wilaya invalide' }, { status: 400 });

  const deliveryPrice = data.deliveryType === 'office' ? wilaya.priceOffice : wilaya.price;
  const total = product.price * data.qty + deliveryPrice;

  const order = await prisma.order.create({
    data: {
      number: 'CMD-' + Date.now().toString(36).toUpperCase(),
      customer: data.customer,
      phone: data.phone,
      wilayaId: data.wilayaId,
      communeId: data.communeId,
      address: data.address,
      total,
      delivery: deliveryPrice,
      deliveryType: data.deliveryType || 'home',
      status: 'pending',
      items: {
        create: { productId: product.id, name: product.name, price: product.price, quantity: data.qty },
      },
    },
  });

  await prisma.product.update({ where: { id: product.id }, data: { stock: product.stock - data.qty } });

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

  return Response.json(order, { status: 201 });
}
