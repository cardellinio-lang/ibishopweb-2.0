import prisma from '@/lib/db';

export async function PATCH(req, { params }) {
  const data = await req.json();
  const order = await prisma.order.update({ where: { id: params.id }, data });
  return Response.json(order);
}
