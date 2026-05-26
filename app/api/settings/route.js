import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map = {};
  settings.forEach(s => { map[s.key] = s.value; });
  return Response.json(map);
}

export async function PATCH(req) {
  const auth = requireAdmin(req); if (auth) return auth;
  const { key, value } = await req.json();
  if (!key) return Response.json({ error: 'key is required' }, { status: 400 });
  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
  return Response.json(setting);
}
