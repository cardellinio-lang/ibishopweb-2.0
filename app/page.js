import prisma from '@/lib/db';
import HomeClient from './HomeClient';
import fallbackProducts from '@/data/products-fallback.json';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = [];
  try { products = await prisma.product.findMany({ where: { active: true, category: { not: 'orva' } }, orderBy: { createdAt: 'desc' } }); } catch {}
  if (!products || products.length === 0) products = fallbackProducts;
  return <HomeClient products={products} />;
}
