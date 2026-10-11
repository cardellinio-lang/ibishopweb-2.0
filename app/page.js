import prisma, { withDbRetry } from '@/lib/db';
import HomeClient from './HomeClient';
import { getHiddenSlugs } from '@/lib/hidden-products';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Bannières animées : détecte ban1/ban2/... dans /public (png, jpg, jpeg, webp)
function getBanners() {
  const dir = path.join(process.cwd(), 'public');
  const out = [];
  for (const name of ['ban1', 'ban2', 'ban3', 'ban4']) {
    for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
      const file = `${name}.${ext}`;
      if (fs.existsSync(path.join(dir, file))) { out.push('/' + file); break; }
    }
  }
  return out;
}

export default async function Home() {
  let products = [];
  try {
    const hidden = await getHiddenSlugs();
    products = await withDbRetry(() => prisma.product.findMany({ where: { active: true, category: { not: 'orva' }, ...(hidden.length ? { slug: { notIn: hidden } } : {}) }, orderBy: { createdAt: 'desc' } }));
  } catch (e) {
    console.error('[home] DB indisponible', e?.message);
  }
  return <HomeClient products={products} banners={getBanners()} />;
}
