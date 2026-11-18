import prisma, { withDbRetry } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const DAY = 24 * 60 * 60 * 1000;

// Lecture seule : cette route ne modifie ni commande, ni produit, ni pixel.
// Elle agrège les 60 derniers jours et compare 30 jours vs 30 jours précédents.
export async function GET(req) {
  const auth = requireAdmin(req); if (auth) return auth;

  const now = new Date();
  const since = new Date(now.getTime() - 60 * DAY);

  const [orders, products, settings] = await Promise.all([
    withDbRetry(() => prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true, createdAt: true, total: true, delivery: true,
        items: { select: { productId: true, name: true, price: true, quantity: true } },
      },
    })),
    withDbRetry(() => prisma.product.findMany({
      select: { id: true, name: true, slug: true, active: true, price: true },
    })),
    withDbRetry(() => prisma.setting.findMany()),
  ]);

  const cfg = {};
  settings.forEach(s => { cfg[s.key] = s.value; });
  const num = (key, fallback = 0) => {
    const v = Number(cfg[key]);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  const params = {
    packaging: num('profit.packaging', 0),
    delivery: num('profit.delivery', 0),
    adsPerOrder: num('profit.adsPerOrder', 0),
    refusalRate: Math.min(100, num('profit.refusalRate', 0)),
  };

  const cutoff = new Date(now.getTime() - 30 * DAY).getTime();
  const rows = new Map();
  for (const p of products) {
    rows.set(p.id, {
      id: p.id, name: p.name, slug: p.slug, active: p.active,
      cost: num(`profit.cost.${p.id}`, 0),
      current: { orders: 0, units: 0, gross: 0 },
      previous: { orders: 0, units: 0, gross: 0 },
    });
  }

  for (const o of orders) {
    const bucket = new Set();
    const period = o.createdAt.getTime() >= cutoff ? 'current' : 'previous';
    for (const it of o.items) {
      let row = rows.get(it.productId);
      if (!row) {
        row = {
          id: it.productId, name: it.name, slug: '', active: false,
          cost: num(`profit.cost.${it.productId}`, 0),
          current: { orders: 0, units: 0, gross: 0 },
          previous: { orders: 0, units: 0, gross: 0 },
        };
        rows.set(it.productId, row);
      }
      const t = row[period];
      t.units += it.quantity;
      t.gross += it.price * it.quantity;
      bucket.add(o.id);
    }
    // Une commande compte une fois par produit, pas une fois par ligne.
    for (const it of o.items) {
      const row = rows.get(it.productId);
      if (!bucket.has(o.id + '|' + it.productId)) {
        row[period].orders += 1;
        bucket.add(o.id + '|' + it.productId);
      }
    }
  }

  const refusal = 1 - params.refusalRate / 100;
  const list = [...rows.values()].map(row => {
    const calc = (t) => {
      const revenue = Math.round(t.gross * refusal);
      const productCost = t.units * row.cost;
      const packaging = t.units * params.packaging;
      const perOrder = t.orders * (params.delivery + params.adsPerOrder);
      const profit = revenue - productCost - packaging - perOrder;
      return {
        orders: t.orders,
        units: t.units,
        gross: t.gross,
        revenue,
        cost: productCost + packaging + perOrder,
        profit,
        margin: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0,
      };
    };
    return { ...row, current: calc(row.current), previous: calc(row.previous) };
  }).sort((a, b) => b.current.profit - a.current.profit);

  const totals = { current: {}, previous: {} };
  for (const period of ['current', 'previous']) {
    totals[period] = list.reduce((acc, row) => {
      for (const k of ['orders', 'units', 'gross', 'revenue', 'cost', 'profit']) acc[k] += row[period][k];
      return acc;
    }, { orders: 0, units: 0, gross: 0, revenue: 0, cost: 0, profit: 0 });
    totals[period].margin = totals[period].revenue > 0
      ? Math.round((totals[period].profit / totals[period].revenue) * 1000) / 10 : 0;
  }

  return Response.json({ params, totals, products: list });
}
