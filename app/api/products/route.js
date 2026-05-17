import prisma from '@/lib/db';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(products);
}

export async function POST(req) {
  const data = await req.json();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const product = await prisma.product.create({
    data: { name: data.name, slug, price: data.price, oldPrice: data.oldPrice || null, images: JSON.stringify(data.images || []), description: data.description || '', color: data.color || '#000000', sku: data.sku || null, stock: data.stock || 1 },
  });
  return Response.json(product, { status: 201 });
}
