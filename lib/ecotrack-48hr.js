const ECOTRACK_48HR_BASE = process.env.ECOTRACK_48HR_API_URL || 'https://48hr.ecotrack.dz';

export class Ecotrack48HError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getToken() {
  const token = process.env.ECOTRACK_48HR_API_TOKEN;
  if (!token) throw new Ecotrack48HError('ECOTRACK_48HR_API_TOKEN non configuré', 0, null);
  return token;
}

function authParams(token) {
  return `api_token=${encodeURIComponent(token)}`;
}

export async function testCredentials() {
  const token = getToken();
  const res = await fetch(`${ECOTRACK_48HR_BASE}/api/v1/validate/token?${authParams(token)}`);
  if (!res.ok) {
    throw new Ecotrack48HError(`Erreur HTTP ${res.status}`, res.status, await res.text());
  }
  const body = await res.json();
  if (body.success === true && body.message === 'VALID_TOKEN') return true;
  if (body.message === 'TOKEN_NOT_ALLOWED') {
    throw new Ecotrack48HError('Token valide mais accès API désactivé. Contactez 48Hr.', 0, body);
  }
  throw new Ecotrack48HError(body.message || 'Token invalide', 0, body);
}

export async function createShipment(order) {
  const token = getToken();

  const items = order.items || [];
  const productDesc = items.map(i => `${i.name} x${i.quantity}`).join(', ') || 'Article';

  const phone = order.phone.replace(/[\s\-]/g, '');
  const phoneClean = phone.startsWith('+213') ? phone.replace('+213', '0')
    : phone.startsWith('213') ? '0' + phone.slice(3)
    : phone;

  const isStopDesk = order.deliveryType === 'office';

  async function trySend(stopDesk) {
    const params = new URLSearchParams({
      reference: order.number,
      nom_client: order.customer || '',
      telephone: phoneClean,
      adresse: order.address || '',
      commune: order.communeName || '',
      code_wilaya: String(order.wilayaId),
      montant: String(order.total),
      produit: productDesc || 'Article',
      remarque: '',
      type: '1',
      stop_desk: stopDesk ? '1' : '0',
      fragile: '0',
      stock: '0',
      api_token: token,
    });

    const res = await fetch(`${ECOTRACK_48HR_BASE}/api/v1/create/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = body?.message || body?.errors
        ? Object.values(body.errors).flat().join('; ')
        : `Erreur EcoTrack 48Hr (${res.status})`;
      return { ok: false, error: msg, status: res.status, body };
    }

    if (body.success === true && body.tracking) {
      return { ok: true, tracking: body.tracking, body, usedStopDesk: stopDesk };
    }

    return { ok: false, error: body?.message || 'Réponse inattendue', body };
  }

  let result;
  if (isStopDesk) {
    result = await trySend(true);
    if (!result.ok) {
      const stopDeskError = result.error;
      result = await trySend(false);
      if (result.ok) {
        result.fellBackToHome = true;
      } else {
        throw new Ecotrack48HError(
          `Stopdesk: ${stopDeskError}. Domicile: ${result.error}`,
          result.status || 500,
          result.body,
        );
      }
    }
  } else {
    result = await trySend(false);
  }

  if (!result.ok) {
    throw new Ecotrack48HError(result.error, result.status || 500, result.body);
  }

  return {
    trackingNumber: result.tracking,
    shipmentId: result.tracking,
    labelUrl: null,
    fellBackToHome: result.fellBackToHome,
    usedStopDesk: result.usedStopDesk,
    raw: result.body,
  };
}

export async function getLabel(trackingNumber) {
  const token = getToken();
  const res = await fetch(
    `${ECOTRACK_48HR_BASE}/api/v1/get/order/label?tracking=${encodeURIComponent(trackingNumber)}&${authParams(token)}`,
  );
  if (!res.ok) throw new Ecotrack48HError('Étiquette non trouvée', res.status, await res.text());
  return res.url || null;
}
