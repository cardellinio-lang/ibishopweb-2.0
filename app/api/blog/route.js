import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

function toSlug(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(post);
  }
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(posts);
}

export async function POST(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const body = await req.json();
  if (!body.title) return Response.json({ error: 'Title required' }, { status: 400 });
  const slug = body.slug || toSlug(body.title);
  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: body.title,
      excerpt: body.excerpt || '',
      icon: body.icon || '📖',
      image: body.image || '',
      category: body.category || '',
      readingTime: body.readingTime || '5 دقائق',
      content: body.content || '[]',
      visible: body.visible !== false,
    },
  });
  return Response.json(post);
}

export async function PUT(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const body = await req.json();
  if (!body.id) return Response.json({ error: 'id required' }, { status: 400 });
  const data = {};
  if (body.title) data.title = body.title;
  if (body.slug) data.slug = body.slug;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.image !== undefined) data.image = body.image;
  if (body.category !== undefined) data.category = body.category;
  if (body.readingTime !== undefined) data.readingTime = body.readingTime;
  if (body.content !== undefined) data.content = body.content;
  if (body.visible !== undefined) data.visible = body.visible;
  const post = await prisma.blogPost.update({ where: { id: body.id }, data });
  return Response.json(post);
}

export async function DELETE(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await prisma.blogPost.delete({ where: { id } });
  return Response.json({ ok: true });
}
