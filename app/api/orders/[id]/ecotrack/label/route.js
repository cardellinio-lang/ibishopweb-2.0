import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { getLabel, EcotrackError } from '@/lib/ecotrack';

export async function GET(req, { params }) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const { id } = params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const tracking = order.ecoTrackData?.trackingNumber;
  if (!tracking) {
    return Response.json({ error: 'Aucun tracking EcoTrack' }, { status: 404 });
  }

  try {
    const url = await getLabel(tracking);
    if (url) {
      await prisma.order.update({
        where: { id },
        data: { ecoTrackData: { ...order.ecoTrackData, labelUrl: url } },
      });
    }
    return url
      ? Response.json({ ok: true, url })
      : Response.json({ ok: false, error: 'Étiquette non disponible' });
  } catch (err) {
    return Response.json({
      error: err instanceof EcotrackError ? err.message : 'Erreur inconnue',
    }, { status: 500 });
  }
}
