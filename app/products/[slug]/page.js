import prisma, { withDbRetry } from '@/lib/db';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductClient from './ProductClient';
import OrvaProductClient from './OrvaProductClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ProductPage({ params }) {
  let product = null;
  let wilayas = [];
  let communes = [];
  let dbFailed = false;
  try {
    product = await withDbRetry(() => prisma.product.findUnique({ where: { slug: params.slug } }));
    if (product) product.images = JSON.parse(product.images || '[]');
    wilayas = await withDbRetry(() => prisma.wilaya.findMany({ orderBy: { id: 'asc' } }));
    communes = await withDbRetry(() => prisma.commune.findMany({ orderBy: [{ wilayaId: 'asc' }, { name: 'asc' }] }));
  } catch (e) {
    // Ne pas transformer une erreur de base en 404 : le produit existe peut-être.
    dbFailed = true;
    console.error('[product-page] DB indisponible pour', params.slug, e?.message);
  }
  if (!dbFailed && (!product || !product.active)) notFound();
  const host = (await headers()).get('host') || '';
  const isOrva = host.includes('orva');
  const Client = isOrva ? OrvaProductClient : ProductClient;
  return <Client product={product} wilayas={JSON.parse(JSON.stringify(wilayas))} communes={JSON.parse(JSON.stringify(communes))} />;
}
