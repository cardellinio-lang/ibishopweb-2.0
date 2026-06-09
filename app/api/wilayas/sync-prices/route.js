import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const ECOTRACK_BASE = process.env.ECOTRACK_API_URL || 'https://packers.ecotrack.dz';

function getToken() {
  const t = process.env.ECOTRACK_API_TOKEN;
  if (!t) throw new Error('ECOTRACK_API_TOKEN non configuré');
  return t;
}

export async function POST(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const token = getToken();
    const res = await fetch(
      `${ECOTRACK_BASE}/api/v1/delivery-pricing/rates?api_token=${encodeURIComponent(token)}`,
    );

    if (!res.ok) {
      const body = await res.text();
      return Response.json({ ok: false, error: `Packers API HTTP ${res.status}: ${body}` }, { status: 200 });
    }

    const data = await res.json();

    let rates = [];
    if (Array.isArray(data)) {
      rates = data;
    } else if (data?.data && Array.isArray(data.data)) {
      rates = data.data;
    } else if (data?.rates && Array.isArray(data.rates)) {
      rates = data.rates;
    } else {
      return Response.json({ ok: false, error: 'Format de réponse Packers inattendu', raw: data }, { status: 200 });
    }

    let updated = 0;
    let skipped = 0;

    for (const rate of rates) {
      const wilayaId = rate.toWilayaId ?? rate.wilaya_id ?? rate.id;
      const homePrice = rate.homeDeliveryPrice ?? rate.home_price ?? rate.price ?? rate.prix_domicile;
      const officePrice = rate.stopDeskPrice ?? rate.stop_desk_price ?? rate.priceOffice ?? rate.prix_bureau ?? rate.office_price;

      if (!wilayaId || homePrice == null) {
        skipped++;
        continue;
      }

      const existing = await prisma.wilaya.findUnique({ where: { id: Number(wilayaId) } });
      if (!existing) {
        skipped++;
        continue;
      }

      await prisma.wilaya.update({
        where: { id: Number(wilayaId) },
        data: {
          price: Math.round(Number(homePrice)),
          priceOffice: officePrice != null ? Math.round(Number(officePrice)) : existing.priceOffice,
        },
      });
      updated++;
    }

    const all = await prisma.wilaya.findMany({ orderBy: { id: 'asc' } });

    return Response.json({ ok: true, updated, skipped, wilayas: all });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 200 });
  }
}
