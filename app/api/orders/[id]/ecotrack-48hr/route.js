import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { createShipment, Ecotrack48HError } from '@/lib/ecotrack-48hr';

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

  const [commune, wilaya] = await Promise.all([
    prisma.commune.findUnique({ where: { id: order.communeId } }),
    prisma.wilaya.findUnique({ where: { id: order.wilayaId } }),
  ]);
  const communeName = commune?.name || '';
  const wilayaName = wilaya?.name || '';
  const orderWithNames = {
    ...order,
    communeName,
    address: order.address || `${communeName}, ${wilayaName}`.replace(/^, /, ''),
  };

  try {
    const result = await createShipment(orderWithNames);

    await prisma.order.update({
      where: { id },
      data: {
        ecoTrack48HrData: {
          trackingNumber: result.trackingNumber,
          shipmentId: result.shipmentId,
          labelUrl: result.labelUrl,
          shippedAt: new Date().toISOString(),
          fellBackToHome: result.fellBackToHome || false,
          raw: result.raw,
        },
      },
    });

    return Response.json({
      ok: true,
      trackingNumber: result.trackingNumber,
      shipmentId: result.shipmentId,
      labelUrl: result.labelUrl,
      fellBackToHome: result.fellBackToHome || false,
    });
  } catch (err) {
    const status = err instanceof Ecotrack48HError && err.status ? err.status : 500;
    return Response.json({
      error: err.message,
      body: err instanceof Ecotrack48HError ? err.body : null,
    }, { status });
  }
}
