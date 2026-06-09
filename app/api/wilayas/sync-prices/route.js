import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const BASE = 'https://packers.ecotrack.dz';

export async function POST(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const token = process.env.ECOTRACK_API_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: 'ECOTRACK_API_TOKEN non configuré' }, { status: 200 });
  }

  try {
    const res = await fetch(`${BASE}/api/v1/get/fees?api_token=${encodeURIComponent(token)}`);

    if (!res.ok) {
      const body = await res.text();
      return Response.json({ ok: false, error: `Packers API HTTP ${res.status}: ${body}` }, { status: 200 });
    }

    const data = await res.json();
    const rows = data?.livraison;

    if (!Array.isArray(rows)) {
      return Response.json({ ok: false, error: 'Format inattendu', raw: data }, { status: 200 });
    }

    let updated = 0;
    let skipped = 0;

    for (const item of rows) {
      const wilayaId = item.wilaya_id;
      const homePrice = item.tarif;
      const officePrice = item.tarif_stopdesk;

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
