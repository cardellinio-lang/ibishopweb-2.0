import prisma, { withDbRetry } from '@/lib/db';
import HomeClient from './HomeClient';
import { getHiddenSlugs } from '@/lib/hidden-products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = [];
  try {
    const hidden = await getHiddenSlugs();
    products = await withDbRetry(() => prisma.product.findMany({ where: { active: true, category: { not: 'orva' }, ...(hidden.length ? { slug: { notIn: hidden } } : {}) }, orderBy: { createdAt: 'desc' } }));
  } catch (e) {
    console.error('[home] DB indisponible', e?.message);
  }
  return <HomeClient products={products} />;
}
