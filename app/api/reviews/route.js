import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return Response.json({ error: 'productId required' }, { status: 400 });
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });
  return Response.json(reviews);
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  if (!data.productId || !data.name || !data.text) {
    return Response.json({ error: 'productId, name, text required' }, { status: 400 });
  }
  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      name: data.name,
      city: data.city || '',
      rating: data.rating || 5,
      text: data.text,
      date: data.date || 'منذ لحظات',
    },
  });
  return Response.json(review, { status: 201 });
}
