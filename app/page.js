import prisma, { withDbRetry } from '@/lib/db';
import HomeClient from './HomeClient';
import { getHiddenSlugs } from '@/lib/hidden-products';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Bannières animées : priorise les visuels éducatifs/orthophonie
function getBanners() {
  const dir = path.join(process.cwd(), 'public');
  const out = [];
  // Ordre forcé: cadre dessin, puis produit edu, puis 3ème au choix
  const preferred = ['ban1', 'ban2', 'ban3'];
  for (const name of preferred) {
    for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
      const file = `${name}.${ext}`;
      if (fs.existsSync(path.join(dir, file))) { out.push('/' + file + '?v=' + Date.now()); break; }
    }
  }
  if (out.length === 0) {
    const fallback = ['ban-cadre', 'ban-edu', 'ban-orthophonie'];
    for (const name of fallback) {
      for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
        const file = `${name}.${ext}`;
        if (fs.existsSync(path.join(dir, file))) { out.push('/' + file + '?v=' + Date.now()); break; }
      }
    }
  }
  return out.slice(0, 3);
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
