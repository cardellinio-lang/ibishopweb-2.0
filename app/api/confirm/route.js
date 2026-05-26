import prisma from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token) {
    return Response.redirect(new URL('/c/' + token, req.url), 302);
  }

  return Response.redirect(new URL('/', req.url), 302);
}
