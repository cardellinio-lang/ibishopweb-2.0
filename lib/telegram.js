// Normalise un numéro algérien au format international (+213 ...).
// Telegram ne transforme en lien cliquable (bleu) que les numéros au format
// international commençant par « + ». Les numéros locaux (0X XX XX XX XX)
// ne sont donc pas cliquables : d'où ce nettoyage.
export function normalizeDzPhone(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  const digits = s.replace(/\D/g, '');
  if (!digits) return s;

  let intl;
  if (s.startsWith('+')) intl = '+' + digits;
  else if (digits.startsWith('00')) intl = '+' + digits.slice(2);
  else if (digits.startsWith('213')) intl = '+' + digits;
  else if (digits.startsWith('0')) intl = '+213' + digits.slice(1);
  else intl = '+213' + digits;

  // Format lisible : +213 555 16 68 74 (mobile = 9 chiffres après l'indicatif)
  const m = intl.match(/^\+213(\d{3})(\d{2})(\d{2})(\d{2})$/);
  if (m) return `+213 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  return intl;
}

export async function sendAdminNotification(orderDetails) {
  const message =
    `🛒 *Nouvelle commande !*\n\n` +
    `📦 *${orderDetails.product}*\n` +
    `📐 Qte: ${orderDetails.qty} x ${orderDetails.price.toLocaleString()} DZD = ${(orderDetails.qty * orderDetails.price).toLocaleString()} DZD\n` +
    `👤 ${orderDetails.customer}\n` +
    `📞 ${normalizeDzPhone(orderDetails.phone)}\n` +
    `📍 ${orderDetails.wilaya} - ${orderDetails.commune}\n` +
    `🏠 ${orderDetails.address || '—'}\n` +
    `🚚 ${orderDetails.deliveryType === 'home' ? 'Domicile' : 'Bureau'}\n` +
    `📦 Livraison: ${orderDetails.deliveryPrice.toLocaleString()} DZD\n` +
    `💰 *Total: ${orderDetails.total.toLocaleString()} DZD*`;

  return sendTelegramMessage(message);
}

export async function sendTelegramTest(siteName) {
  return sendTelegramMessage(
    `🔔 *Test de notification*\n\nSite : *${siteName}*\nSi tu reçois ce message avec un son, les notifications fonctionnent.`
  );
}

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[TELEGRAM] Configuration manquante (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_notification: false,
        disable_web_page_preview: false,
      }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) {
      console.error('[TELEGRAM] Envoi échoué', { status: res.status, error: result.description || 'unknown' });
      return false;
    }
    console.log('[TELEGRAM] Notification envoyée', { chatId, messageId: result.result?.message_id });
    return true;
  } catch (e) {
    console.error('Telegram notification failed:', e);
    return false;
  }
}
