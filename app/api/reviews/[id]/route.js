import prisma, { withDbRetry } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(req, { params }) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  const review = await withDbRetry(() => prisma.review.update({
    where: { id: params.id },
    data: { name: data.name, city: data.city || '', rating: data.rating || 5, text: data.text, date: data.date || '', image: data.image || null },
  }), { retries: 5 });
  return Response.json(review);
}

export async function DELETE(req, { params }) {
  const auth = requireAdmin(req); if (auth) return auth;
  await withDbRetry(() => prisma.review.delete({ where: { id: params.id } }), { retries: 5 });
  return Response.json({ success: true });
}
