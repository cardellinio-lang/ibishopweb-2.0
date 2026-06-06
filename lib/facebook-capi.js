import { createHash } from 'crypto';

const sha256 = (s) => createHash('sha256').update(s || '').digest('hex');

/**
 * Send events to Facebook Conversions API for pixel coverage deduplication.
 * @param {object[]} events — Array of CAPI event objects
 * @param {string} pixelId — FB Pixel ID
 * @param {string} accessToken — CAPI access token
 */
export async function sendCapiEvents(events, pixelId, accessToken) {
  if (!pixelId || !accessToken || !events?.length) return;

  const payload = {
    data: events.map(e => ({
      event_name: e.event_name,
      event_time: e.event_time || Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: e.event_source_url || '',
      event_id: e.event_id,
      user_data: {
        ph: e.phone ? [sha256(e.phone)] : [],
        ct: e.city ? [sha256(e.city)] : [],
        country: ['DZ'],
        client_ip_address: e.ip || '',
        client_user_agent: e.ua || '',
      },
      custom_data: {
        currency: 'DZD',
        value: e.value || 0,
        content_ids: e.content_ids || [],
        content_type: 'product',
        num_items: e.num_items || 1,
      },
    })),
  };

  const url = `https://graph.facebook.com/v22.0/${pixelId}/events?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok || body?.error) {
    console.error('[CAPI]', JSON.stringify(body?.error || body));
  }
  return body;
}
