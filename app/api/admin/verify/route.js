export async function POST(req) {
  const data = await req.json();
  const valid = process.env.ADMIN_PASSWORD && data.password === process.env.ADMIN_PASSWORD;
  if (!valid) return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true });
}
