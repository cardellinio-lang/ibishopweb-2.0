import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(req, { params }) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  const review = await prisma.review.update({
    where: { id: params.id },
    data: { name: data.name, city: data.city || '', rating: data.rating || 5, text: data.text, date: data.date || '' },
  });
  return Response.json(review);
}

export async function DELETE(req, { params }) {
  const auth = requireAdmin(req); if (auth) return auth;
  await prisma.review.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
