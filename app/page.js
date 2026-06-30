import prisma from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = [];
  try { products = await prisma.product.findMany({ where: { active: true, category: { not: 'orva' } }, orderBy: { createdAt: 'desc' } }); } catch {}
  return <HomeClient products={products} />;
}
