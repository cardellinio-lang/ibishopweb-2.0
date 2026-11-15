import prisma, { withDbRetry } from '@/lib/db';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductClient from './ProductClient';
import OrvaProductClient from './OrvaProductClient';
import { CADRE_SLUG, CADRE_BASE_PRICE } from '@/lib/pricing';
import { productSeo } from '@/lib/product-seo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const SITE_NAME = 'IBI Kids';
const FALLBACK_IMAGE = '/logo-ibi-navy.png';

function parseImages(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function absoluteUrl(url, host) {
  if (!url) return `https://${host}${FALLBACK_IMAGE}`;
  return /^https?:\/\//i.test(url) ? url : `https://${host}${url.startsWith('/') ? '' : '/'}${url}`;
}

function plainText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Prix affiché sur la fiche : le cadre A4 a une offre dédiée (lib/pricing.js),
// sinon on utilise le prix du produit. Le JSON-LD doit refléter la page.
function displayedPrice(product) {
  return product.slug === CADRE_SLUG ? CADRE_BASE_PRICE : product.price;
}

export async function generateMetadata({ params }) {
  let product = null;
  try {
    product = await withDbRetry(() => prisma.product.findUnique({ where: { slug: params.slug } }));
  } catch (e) {
    console.error('[product-metadata] DB indisponible pour', params.slug, e?.message);
  }
  if (!product) return { title: SITE_NAME };

  const host = (await headers()).get('host') || 'ibishop-dz.com';
  const url = `https://${host}/products/${product.slug}`;
  const seo = productSeo(product.slug) || {};
  const title = `${seo.title || product.name} | ${SITE_NAME}`;
  const plain = plainText(product.description);
  const excerpt = `${plain.slice(0, 130)}${plain.length > 130 ? '…' : ''}`.trim();
  const description = `${seo.description || excerpt} ✓ الدفع عند الاستلام ✓ التوصيل إلى 58 ولاية`.trim();
  const image = absoluteUrl(parseImages(product.images)[0], host);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      locale: 'ar_DZ',
      title: seo.title || product.name,
      description,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || product.name,
      description,
      images: [image],
    },
  };
}

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

  // Données structurées : permet à Google d'afficher prix et disponibilité.
  // Pas d'aggregateRating : les avis saisis manuellement ne sont pas vérifiables.
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: (Array.isArray(product.images) ? product.images : []).map((img) => absoluteUrl(img, host)),
    description: plainText(product.description),
    sku: product.sku || product.slug,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url: `https://${host}/products/${product.slug}`,
      priceCurrency: 'DZD',
      price: String(displayedPrice(product)),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <Client product={product} wilayas={JSON.parse(JSON.stringify(wilayas))} communes={JSON.parse(JSON.stringify(communes))} />
    </>
  );
}
