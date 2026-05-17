import prisma from '@/lib/db';

export async function GET(req, { params }) {
  const communes = await prisma.commune.findMany({ where: { wilayaId: Number(params.id) }, orderBy: { name: 'asc' } });
  return Response.json(communes);
}
