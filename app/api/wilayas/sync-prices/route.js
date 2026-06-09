import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const BASE = 'https://packers.ecotrack.dz';

export async function POST(req) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const token = process.env.ECOTRACK_API_TOKEN;
  if (!token) return Response.json({ ok: false, error: 'ECOTRACK_API_TOKEN non configuré' }, { status: 200 });

  const endpoints = [
    '/api/v1/get/fees',
    '/api/v1/tarifs',
    '/api/v1/delivery-pricing/rates',
    '/api/v1/prices',
    '/api/v1/get/tarifs',
    '/api/v1/fees',
  ];

  const results = [];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE}${ep}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      results.push({ auth: 'Bearer', endpoint: ep, status: res.status, body: text.slice(0, 500) });
    } catch (err) {
      results.push({ auth: 'Bearer', endpoint: ep, error: err.message });
    }
  }

  // Also try with api_token query param (legacy auth)
  for (const ep of endpoints) {
    try {
      const sep = ep.includes('?') ? '&' : '?';
      const res = await fetch(`${BASE}${ep}${sep}api_token=${encodeURIComponent(token)}`);
      const text = await res.text();
      results.push({ auth: 'api_token', endpoint: ep, status: res.status, body: text.slice(0, 500) });
    } catch (err) {
      results.push({ auth: 'api_token', endpoint: ep, error: err.message });
    }
  }

  return Response.json({
    ok: false,
    error: 'Aucun endpoint ne fonctionne. Détails :',
    debug: results,
  }, { status: 200 });
}
