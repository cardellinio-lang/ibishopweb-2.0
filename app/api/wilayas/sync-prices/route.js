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

    const res = await fetch(`${ECOTRACK_BASE}/api/v1/tarifs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      return Response.json({ ok: false, error: `Packers API HTTP ${res.status}: ${body}` }, { status: 200 });
    }

    const data = await res.json();
    const rows = data?.tarifs ?? data?.data ?? data;

    if (!Array.isArray(rows)) {
      return Response.json({ ok: false, error: 'Format inattendu', raw: data }, { status: 200 });
    }

    let updated = 0;
    let skipped = 0;

    for (const item of rows) {
      const wilayaId = item.wilaya_id ?? item.id;
      const homePrice = item.home_price ?? item.price;
      const officePrice = item.stopdesk_price ?? item.office_price;

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
