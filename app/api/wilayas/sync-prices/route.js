import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import ShippingDz, { ShippingProvider } from 'shippingdz';

export async function POST(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    const token = process.env.ECOTRACK_API_TOKEN;
    if (!token) throw new Error('ECOTRACK_API_TOKEN non configuré');

    const provider = ShippingDz.provider(ShippingProvider.PACKERS, { token });
    const rates = await provider.getRates();

    if (!Array.isArray(rates)) {
      return Response.json({ ok: false, error: 'Format rates inattendu', raw: rates }, { status: 200 });
    }

    let updated = 0;
    let skipped = 0;

    for (const rate of rates) {
      const wilayaId = rate.toWilayaId ?? rate.wilaya_id ?? rate.id;
      const homePrice = rate.homeDeliveryPrice ?? rate.home_price ?? rate.price;
      const officePrice = rate.stopDeskPrice ?? rate.stopdesk_price ?? rate.office_price;

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
