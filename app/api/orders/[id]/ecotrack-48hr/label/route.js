import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { getLabel, Ecotrack48HError } from '@/lib/ecotrack-48hr';

export async function GET(req, { params }) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const { id } = params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const tracking = order.ecoTrack48HrData?.trackingNumber;
  if (!tracking) {
    return Response.json({ error: 'Aucun tracking 48Hr' }, { status: 404 });
  }

  try {
    const url = await getLabel(tracking);
    if (url) {
      await prisma.order.update({
        where: { id },
        data: { ecoTrack48HrData: { ...order.ecoTrack48HrData, labelUrl: url } },
      });
      return Response.redirect(url, 302);
    }
    return Response.json({ ok: false, error: 'Étiquette non disponible' });
  } catch (err) {
    return Response.json({
      error: err instanceof Ecotrack48HError ? err.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}
