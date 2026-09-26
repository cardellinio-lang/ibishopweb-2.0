export async function sendAdminNotification(orderDetails) {
  const message =
    `🛒 *Nouvelle commande !*\n\n` +
    `📦 *${orderDetails.product}*\n` +
    `📐 Qte: ${orderDetails.qty} x ${orderDetails.price.toLocaleString()} DZD = ${(orderDetails.qty * orderDetails.price).toLocaleString()} DZD\n` +
    `👤 ${orderDetails.customer}\n` +
    `📞 ${orderDetails.phone}\n` +
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
