import prisma, { withDbRetry } from '@/lib/db';
import HomeClient from './HomeClient';
import { getHiddenSlugs } from '@/lib/hidden-products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = [];
  let featuredProduct = null;
  try {
    const hidden = await getHiddenSlugs();
    products = await withDbRetry(() => prisma.product.findMany({ where: { active: true, category: { not: 'orva' }, ...(hidden.length ? { slug: { notIn: hidden } } : {}) }, orderBy: { createdAt: 'desc' } }));
  } catch (e) {
    console.error('[home] DB indisponible', e?.message);
  }
  try {
    featuredProduct = await withDbRetry(() => prisma.product.findUnique({ where: { slug: 'cadre-dessin-enfant-a4' } }));
    if (!featuredProduct?.active) featuredProduct = null;
  } catch (e) {
    console.error('[home] produit mis en avant indisponible', e?.message);
  }
  return <HomeClient products={products} featuredProduct={featuredProduct || products[0] || null} />;
}
