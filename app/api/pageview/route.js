import prisma, { withDbRetry } from '@/lib/db';

export async function POST(req) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let event = 'page_view';

  try {
    const body = await req.json();
    if (['page_view', 'product_view', 'order_start'].includes(body?.event)) event = body.event;
  } catch {}

  // Une statistique de visite ne doit jamais faire échouer la requête.
  try {
    const existing = await withDbRetry(() => prisma.pageView.findFirst({
      where: { date: { gte: today }, path: event },
    }));

    if (existing) {
      await withDbRetry(() => prisma.pageView.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      }));
    } else {
      await withDbRetry(() => prisma.pageView.create({
        data: { date: today, path: event, count: 1 },
      }));
    }
  } catch (e) {
    console.error('[pageview] ignoré, DB saturée:', e?.message);
  }

  return Response.json({ ok: true });
}
