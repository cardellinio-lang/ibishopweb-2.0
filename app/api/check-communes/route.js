import prisma from '@/lib/db';

export async function GET() {
  const total = await prisma.commune.count();
  const withAr = await prisma.commune.count({ where: { NOT: { name_ar: '' } } });
  const sample = await prisma.commune.findMany({ take: 5, orderBy: { id: 'asc' } });
  const sampleWithAr = await prisma.commune.findMany({ take: 5, orderBy: { id: 'asc' }, where: { NOT: { name_ar: '' } } });
  return Response.json({ total, withArabic: withAr, sample, sampleWithArabic: sampleWithAr });
}
