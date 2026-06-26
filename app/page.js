import prisma from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await prisma.product.findMany({ where: { active: true, category: { not: 'orva' } }, orderBy: { createdAt: 'desc' } });
  return <HomeClient products={products} />;
}
