import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

function cleanImages(images) {
  return JSON.stringify((images || []).filter(i => i && (i.startsWith('http') || i.startsWith('data:'))));
}

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(products);
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const data = await req.json();
  if (!data.name || !data.name.trim()) return Response.json({ error: 'Nom requis' }, { status: 400 });
  if (!data.price || data.price < 0) return Response.json({ error: 'Prix invalide' }, { status: 400 });
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const product = await prisma.product.create({
    data: { name: data.name, slug, price: Number(data.price), oldPrice: data.oldPrice || null, images: cleanImages(data.images), description: data.description || '', color: data.color || '#000000', category: data.category || '', sku: data.sku || null, stock: Math.max(0, Number(data.stock || 1)), tierEnabled: data.tierEnabled || false, tierQty: data.tierQty || null, tierPrice: data.tierPrice || null, tierMessage: data.tierMessage || null, tierGift: data.tierGift || null },
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
