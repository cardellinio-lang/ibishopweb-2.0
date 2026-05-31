import { requireAdmin } from '@/lib/admin-auth';
import { testCredentials, EcotrackError } from '@/lib/ecotrack';

export async function GET(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  try {
    await testCredentials();
    return Response.json({ ok: true, message: '✅ Token valide — connexion réussie' });
  } catch (err) {
    const msg = err instanceof EcotrackError ? err.message : 'Erreur inconnue';
    return Response.json({ ok: false, message: msg }, { status: 200 });
  }
}
