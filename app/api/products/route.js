import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

function cleanImages(images) {
  return JSON.stringify((images || []).filter(i => i && (i.startsWith('http') || i.startsWith('data:'))));
}

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { position: 'asc' } });
  return new Response(JSON.stringify(products), {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function PATCH(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const body = await req.json();

  // Direct position set — swap: { id, position: <1-based-index> }
  if (body.id && body.position !== undefined) {
    const products = await prisma.product.findMany({ orderBy: { position: 'asc' } });
    const currentIdx = products.findIndex(p => p.id === body.id);
    if (currentIdx === -1) return Response.json({ error: 'Produit introuvable' }, { status: 404 });
    const targetIdx = Math.max(0, Math.min(products.length - 1, body.position - 1));
    const target = products[targetIdx];
    const current = products[currentIdx];
    // Swap positions
    await prisma.$transaction([
      prisma.product.update({ where: { id: current.id }, data: { position: target.position } }),
      prisma.product.update({ where: { id: target.id }, data: { position: current.position } }),
    ]);
    return Response.json({ success: true, products: await prisma.product.findMany({ orderBy: { position: 'asc' } }) });
  }

  // Legacy direction-based (up/down) — keep for compatibility
  const { id, direction } = body;
  if (!id || !direction) return Response.json({ error: 'Paramètres manquants' }, { status: 400 });

  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return Response.json({ error: 'Produit introuvable' }, { status: 404 });

  const neighbor = direction === 'up'
    ? await prisma.product.findFirst({ where: { position: { lt: current.position } }, orderBy: { position: 'desc' } })
    : await prisma.product.findFirst({ where: { position: { gt: current.position } }, orderBy: { position: 'asc' } });

  if (!neighbor) return Response.json({ error: direction === 'up' ? 'Déjà en haut' : 'Déjà en bas' }, { status: 400 });

  await prisma.$transaction([
    prisma.product.update({ where: { id: current.id }, data: { position: neighbor.position } }),
    prisma.product.update({ where: { id: neighbor.id }, data: { position: current.position } }),
  ]);

  return Response.json({ success: true, products: await prisma.product.findMany({ orderBy: { position: 'asc' } }) });
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const maxPos = await prisma.product.aggregate({ _max: { position: true } });
  const position = (maxPos._max.position || 0) + 10;
  const product = await prisma.product.create({
    data: { name: data.name, slug, price: data.price, oldPrice: data.oldPrice || null, images: cleanImages(data.images), description: data.description || '', color: data.color || '#000000', category: data.category || '', sku: data.sku || null, stock: data.stock || 1, position, tierEnabled: data.tierEnabled || false, tierQty: data.tierQty || null, tierPrice: data.tierPrice || null, tierMessage: data.tierMessage || null, tierGift: data.tierGift || null },
  });
  return Response.json(product, { status: 201 });
}

export async function DELETE(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'ID manquant' }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
