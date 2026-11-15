import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return Response.json({ error: 'productId required' }, { status: 400 });

  // Si la colonne image n'est pas encore en base (déploiement partiel),
  // on renvoie quand même les avis sans photo plutôt qu'une erreur.
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(reviews);
  } catch (e) {
    console.error('[reviews] lecture avec image impossible, repli sans photo:', e?.message);
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, productId: true, name: true, city: true, rating: true, text: true, date: true, createdAt: true },
    });
    return Response.json(reviews.map((r) => ({ ...r, image: null })));
  }
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
      image: data.image || null,
    },
  });
  return Response.json(review, { status: 201 });
}
