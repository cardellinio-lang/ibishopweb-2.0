const ECOTRACK_BASE = process.env.ECOTRACK_API_URL || 'https://packers.ecotrack.dz';

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

function authParams(token) {
  return `api_token=${encodeURIComponent(token)}`;
}

export async function testCredentials() {
  const token = getToken();
  const res = await fetch(`${ECOTRACK_BASE}/api/v1/validate/token?${authParams(token)}`);
  if (!res.ok) {
    throw new EcotrackError(`Erreur HTTP ${res.status}`, res.status, await res.text());
  }
  const body = await res.json();
  if (body.success === true && body.message === 'VALID_TOKEN') return true;
  if (body.message === 'TOKEN_NOT_ALLOWED') {
    throw new EcotrackError('Token valide mais accès API désactivé. Contactez Packers.', 0, body);
  }
  throw new EcotrackError(body.message || 'Token invalide', 0, body);
}

export async function createShipment(order) {
  const token = getToken();

  const items = order.items || [];
  const productDesc = items.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Article';

  const phone = order.phone.replace(/[\s\-]/g, '');
  const phoneClean = phone.startsWith('+213') ? phone.replace('+213', '0')
    : phone.startsWith('213') ? '0' + phone.slice(3)
    : phone;

  const params = new URLSearchParams({
    reference: order.number,
    nom_client: order.customer || '',
    telephone: phoneClean,
    adresse: order.address || '',
    commune: order.communeName || '',
    code_wilaya: String(order.wilayaId),
    montant: String(order.total),
    produit: productDesc,
    type: '1',
    stop_desk: order.deliveryType === 'office' ? '1' : '0',
    stock: '0',
    api_token: token,
  });

  const res = await fetch(`${ECOTRACK_BASE}/api/v1/create/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = body?.message || body?.errors
      ? Object.values(body.errors).flat().join('; ')
      : `Erreur EcoTrack (${res.status})`;
    throw new EcotrackError(msg, res.status, body);
  }

  if (body.success === true && body.tracking) {
    return {
      trackingNumber: body.tracking,
      shipmentId: body.tracking,
      labelUrl: null,
      raw: body,
    };
  }

  throw new EcotrackError(
    body?.message || 'Réponse inattendue de l\'API',
    res.status,
    body,
  );
}

export async function getLabel(trackingNumber) {
  const token = getToken();
  const res = await fetch(
    `${ECOTRACK_BASE}/api/v1/get/order/label?tracking=${encodeURIComponent(trackingNumber)}&${authParams(token)}`,
  );
  if (!res.ok) throw new EcotrackError('Étiquette non trouvée', res.status, await res.text());
  return res.url || null;
}
