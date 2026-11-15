import prisma, { withDbRetry } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return Response.json({ error: 'productId required' }, { status: 400 });

  // La base Neon sature parfois (15 connexions max). On réessaie au lieu de
  // renvoyer une erreur : les avis sont un élément de conversion.
  try {
    const reviews = await withDbRetry(() => prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    }), { retries: 5 });
    return Response.json(reviews);
  } catch (e) {
    const msg = String(e?.message || e);
    // Repli uniquement si la colonne image n'existe pas (déploiement partiel).
    if (/column .*image.* does not exist|Unknown argument .image/i.test(msg)) {
      console.error('[reviews] colonne image absente, repli sans photo');
      const reviews = await withDbRetry(() => prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        select: { id: true, productId: true, name: true, city: true, rating: true, text: true, date: true, createdAt: true },
      }), { retries: 5 });
      return Response.json(reviews.map((r) => ({ ...r, image: null })));
    }
    console.error('[reviews] lecture impossible:', msg);
    // Tableau vide plutôt qu'une 500 : la fiche produit reste intacte.
    return Response.json([]);
  }
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  if (!data.productId || !data.name || !data.text) {
    return Response.json({ error: 'productId, name, text required' }, { status: 400 });
  }
  const review = await withDbRetry(() => prisma.review.create({
    data: {
      productId: data.productId,
      name: data.name,
      city: data.city || '',
      rating: data.rating || 5,
      text: data.text,
      date: data.date || 'منذ لحظات',
      image: data.image || null,
    },
  }), { retries: 5 });
  return Response.json(review, { status: 201 });
}
