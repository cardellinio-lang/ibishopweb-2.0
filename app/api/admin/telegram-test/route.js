import { requireAdmin } from '@/lib/admin-auth';
import { sendTelegramTest } from '@/lib/telegram';

export async function POST(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const sent = await sendTelegramTest('iBishope');
  return Response.json({ success: sent }, { status: sent ? 200 : 502 });
}
