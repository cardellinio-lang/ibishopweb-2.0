export async function sendAdminNotification(orderDetails) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

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

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_notification: false,
        disable_web_page_preview: false,
      }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) {
      console.error('[TELEGRAM] Envoi échoué', { status: res.status, error: result.description || 'unknown' });
    } else {
      console.log('[TELEGRAM] Notification envoyée', { chatId, messageId: result.result?.message_id });
    }
  } catch (e) {
    console.error('Telegram notification failed:', e);
  }
}
