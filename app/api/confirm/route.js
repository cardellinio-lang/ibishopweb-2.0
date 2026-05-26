import prisma from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action) {
    return Response.redirect(new URL('/confirm?error=missing', req.url), 302);
  }

  if (action !== 'yes' && action !== 'no') {
    return Response.redirect(new URL('/confirm?error=invalid', req.url), 302);
  }

  const order = await prisma.order.findUnique({ where: { token } });
  if (!order) {
    return Response.redirect(new URL('/confirm?error=notfound', req.url), 302);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      confirmed: action === 'yes' ? 'yes' : 'no',
      status: action === 'yes' ? 'confirmed' : 'cancelled',
    },
  });

  return Response.redirect(
    new URL(`/confirm?token=${token}&action=${action}`, req.url),
    302
  );
}
