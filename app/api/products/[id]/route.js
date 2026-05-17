import prisma from '@/lib/db';

export async function PUT(req, { params }) {
  const data = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: { name: data.name, price: data.price, oldPrice: data.oldPrice || null, images: JSON.stringify(data.images || []), description: data.description || '', color: data.color || '#000000', sku: data.sku || null, stock: data.stock || 1 },
  });
  return Response.json(product);
}

export async function PATCH(req, { params }) {
  const data = await req.json();
  const product = await prisma.product.update({ where: { id: params.id }, data });
  return Response.json(product);
}

export async function DELETE(req, { params }) {
  await prisma.product.update({ where: { id: params.id }, data: { active: false } });
  return Response.json({ ok: true });
}
