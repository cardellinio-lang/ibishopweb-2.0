import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductClient from './ProductClient';
import OrvaProductClient from './OrvaProductClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product || !product.active) notFound();
  product.images = JSON.parse(product.images || '[]');
  const wilayas = await prisma.wilaya.findMany({ orderBy: { id: 'asc' } });
  const communes = await prisma.commune.findMany({ orderBy: [{ wilayaId: 'asc' }, { name: 'asc' }] });
  const host = (await headers()).get('host') || '';
  const isOrva = host.includes('orva');
  const Client = isOrva ? OrvaProductClient : ProductClient;
  return <Client product={product} wilayas={JSON.parse(JSON.stringify(wilayas))} communes={JSON.parse(JSON.stringify(communes))} />;
}
