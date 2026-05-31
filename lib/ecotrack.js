const ECOTRACK_BASE = 'https://packers.ecotrack.dz';

export class EcotrackError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getToken() {
  const token = process.env.ECOTRACK_API_TOKEN;
  if (!token) throw new EcotrackError('ECOTRACK_API_TOKEN non configuré', 0, null);
  return token;
}

export async function testCredentials() {
  const token = getToken();
  const res = await fetch(`${ECOTRACK_BASE}/api/v1/parcels?per_page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new EcotrackError('Token EcoTrack invalide', res.status, await res.text());
  return true;
}

export async function createShipment(order) {
  const token = getToken();
  const nameParts = (order.customer || '').trim().split(/\s+/);
  const firstName = nameParts[0] || order.customer;
  const lastName = nameParts.slice(1).join(' ') || '';

  const items = order.items || [];
  const productDesc = items.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Article';

  const payload = {
    reference: order.number,
    firstname: firstName,
    lastname: lastName,
    phone: order.phone,
    address: order.address || '',
    wilaya_id: String(order.wilayaId),
    commune: order.communeName || '',
    product: productDesc,
    cod: order.total,
    delivery_type: order.deliveryType === 'office' ? 2 : 1,
    is_fragile: false,
  };

  const res = await fetch(`${ECOTRACK_BASE}/api/v1/parcels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new EcotrackError(
      body?.message || body?.error || `Erreur EcoTrack (${res.status})`,
      res.status,
      body,
    );
  }

  return {
    trackingNumber: body.tracking || body.barcode || body.id || null,
    shipmentId: String(body.id || ''),
    labelUrl: null,
    raw: body,
  };
}

export async function getLabel(trackingNumber) {
  const token = getToken();
  const res = await fetch(`${ECOTRACK_BASE}/api/v1/parcels/${trackingNumber}/label`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new EcotrackError('Étiquette non trouvée', res.status, await res.text());
  const body = await res.json();
  return body.url || null;
}

export async function getShipment(trackingNumber) {
  const token = getToken();
  const res = await fetch(`${ECOTRACK_BASE}/api/v1/parcels/${trackingNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new EcotrackError('Expédition non trouvée', res.status, await res.text());
  return res.json();
}
