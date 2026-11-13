import prisma, { withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://ibishop-dz.com';

// Plan du site : accélère le recrawl par Google (et donc la mise à jour du
// nom du site affiché dans les résultats de recherche).
export default async function sitemap() {
  const now = new Date();
  const entries = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const [products, posts] = await Promise.all([
      withDbRetry(() => prisma.product.findMany({
        where: { active: true, category: { not: 'orva' } },
        select: { slug: true, createdAt: true },
        orderBy: { position: 'asc' },
      })),
      withDbRetry(() => prisma.blogPost.findMany({
        where: { visible: true },
        select: { slug: true, updatedAt: true },
      })),
    ]);
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.createdAt || now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
    for (const b of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: b.updatedAt || now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (e) {
    console.error('[sitemap] DB indisponible:', e?.message);
  }

  return entries;
}
