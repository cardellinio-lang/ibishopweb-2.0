import prisma, { withDbRetry } from '@/lib/db';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ProductClient from './ProductClient';
import OrvaProductClient from './OrvaProductClient';
import { CADRE_SLUG, CADRE_BASE_PRICE } from '@/lib/pricing';
import { productSeo } from '@/lib/product-seo';
import { displayDescription } from '@/lib/product-copy';

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
    product = await withDbRetry(() => prisma.product.findUnique({ where: { slug: params.slug } }), { retries: 5 });
  } catch (e) {
    console.error('[product-metadata] DB indisponible pour', params.slug, e?.message);
  }
  if (!product) return { title: SITE_NAME };

  const host = (await headers()).get('host') || 'ibishop-dz.com';
  const url = `https://${host}/products/${product.slug}`;
  const seo = productSeo(product.slug) || {};
  const title = `${seo.title || product.name} | ${SITE_NAME}`;
  const plain = plainText(displayDescription(product));
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
    product = await withDbRetry(() => prisma.product.findUnique({ where: { slug: params.slug } }), { retries: 5 });
    if (product) {
      product.images = JSON.parse(product.images || '[]');
      product.description = displayDescription(product);
    }
    wilayas = await withDbRetry(() => prisma.wilaya.findMany({ orderBy: { id: 'asc' } }), { retries: 5 });
    communes = await withDbRetry(() => prisma.commune.findMany({ orderBy: [{ wilayaId: 'asc' }, { name: 'asc' }] }), { retries: 5 });
  } catch (e) {
    // Ne pas transformer une erreur de base en 404 : le produit existe peut-être.
    dbFailed = true;
    console.error('[product-page] DB indisponible pour', params.slug, e?.message);
  }
  if (!dbFailed && (!product || !product.active)) notFound();

  // Base momentanément indisponible : page de reprise plutôt qu'une erreur 500.
  // Un clic publicitaire qui tombe sur une erreur, c'est de l'argent perdu.
  if (!product) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center' }}>
        <img src={FALLBACK_IMAGE} alt={SITE_NAME} style={{ height: 46 }} />
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#17131A', margin: 0 }}>تحميل المنتج لم يكتمل</h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 380, margin: 0, lineHeight: 1.6 }}>
          صار مشكل صغير في الاتصال. عاود المحاولة — المنتج مازال متوفر والدفع عند الاستلام.
        </p>
        <a href={`/products/${params.slug}`} style={{ padding: '12px 28px', borderRadius: 999, background: '#55C6C0', color: '#17131A', fontWeight: 800, textDecoration: 'none' }}>
          إعادة المحاولة
        </a>
      </main>
    );
  }

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
