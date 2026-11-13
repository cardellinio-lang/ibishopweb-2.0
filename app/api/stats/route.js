import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req) {
  const auth = requireAdmin(req); if (auth) return auth;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const pageViewPaths = ['/', 'page_view'];
  const totalPageViews = await prisma.pageView.aggregate({
    where: { path: { in: pageViewPaths } },
    _sum: { count: true },
  });
  const todayViews = await prisma.pageView.aggregate({
    where: { date: { gte: today }, path: { in: pageViewPaths } },
    _sum: { count: true },
  });
  const [totalOrders, todayOrders, funnelEvents] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.findMany({
      where: { date: { gte: today }, path: { in: ['product_view', 'order_start'] } },
      select: { path: true, count: true },
    }),
  ]);
  const totalProducts = await prisma.product.count({ where: { active: true } });

  // Last 7 days views
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyRows = await prisma.pageView.findMany({
    where: { date: { gte: weekAgo }, path: { in: pageViewPaths } },
    orderBy: { date: 'asc' },
  });
  const weeklyByDay = new Map();
  for (const row of weeklyRows) {
    const day = row.date.toISOString().slice(0, 10);
    weeklyByDay.set(day, (weeklyByDay.get(day) || 0) + row.count);
  }
  const weeklyViews = [...weeklyByDay].map(([date, count]) => ({ date, count }));
  const todayProductViews = funnelEvents
    .filter(event => event.path === 'product_view')
    .reduce((sum, event) => sum + event.count, 0);
  const todayOrderStarts = funnelEvents
    .filter(event => event.path === 'order_start')
    .reduce((sum, event) => sum + event.count, 0);

  return Response.json({
    totalViews: totalPageViews._sum.count || 0,
    todayViews: todayViews._sum.count || 0,
    totalOrders,
    todayOrders,
    todayProductViews,
    todayOrderStarts,
    totalProducts,
    weeklyViews,
  });
}
