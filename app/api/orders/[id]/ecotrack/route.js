import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { createShipment, EcotrackError } from '@/lib/ecotrack';

export async function POST(req, { params }) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const commune = await prisma.commune.findUnique({ where: { id: order.communeId } });
  const orderWithNames = {
    ...order,
    communeName: commune?.name || '',
  };

  try {
    const result = await createShipment(orderWithNames);

    await prisma.order.update({
      where: { id },
      data: {
        ecoTrackData: {
          trackingNumber: result.trackingNumber,
          shipmentId: result.shipmentId,
          labelUrl: result.labelUrl,
          shippedAt: new Date().toISOString(),
          raw: result.raw,
        },
      },
    });

    return Response.json({
      ok: true,
      trackingNumber: result.trackingNumber,
      shipmentId: result.shipmentId,
      labelUrl: result.labelUrl,
    });
  } catch (err) {
    const status = err instanceof EcotrackError && err.status ? err.status : 500;
    return Response.json({
      error: err.message,
      body: err instanceof EcotrackError ? err.body : null,
    }, { status });
  }
}
