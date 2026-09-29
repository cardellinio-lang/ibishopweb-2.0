import prisma, { withDbRetry } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = [];
  try {
    products = await withDbRetry(() => prisma.product.findMany({ where: { active: true, category: { not: 'orva' } }, orderBy: { createdAt: 'desc' } }));
  } catch (e) {
    console.error('[home] DB indisponible', e?.message);
  }
  return <HomeClient products={products} />;
}
