import { requireAdmin } from '@/lib/admin-auth';
import { testCredentials, Ecotrack48HError } from '@/lib/ecotrack-48hr';

export async function GET(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    await testCredentials();
    return Response.json({ ok: true, message: '✅ Token 48Hr valide — connexion réussie' });
  } catch (err) {
    const msg = err instanceof Ecotrack48HError ? err.message : 'Erreur inconnue';
    return Response.json({ ok: false, message: msg }, { status: 200 });
  }
}
