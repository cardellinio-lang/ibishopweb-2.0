import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const slug = 'etagere-murale-montessori-enfant-53x19-blanc';
    const images = [
      'https://i.ibb.co/k2jW4MLf/1.jpg',
      'https://i.ibb.co/2YdBJtdV/2.jpg',
      'https://i.ibb.co/dwSQcRhp/3.jpg',
      'https://i.ibb.co/zVJdPKjs/4.jpg',
      'https://i.ibb.co/xqcnWHkV/5.jpg',
      'https://i.ibb.co/Z1gbf9kb/6.jpg',
      'https://i.ibb.co/9CqfbpV/7.jpg',
      'https://i.ibb.co/XrbcNFbd/8.jpg',
      'https://i.ibb.co/HD2GY3xn/9.jpg',
      'https://i.ibb.co/vxRk17Nt/10.jpg',
      'https://i.ibb.co/Z6cmMTyr/11.jpg',
    ];
    const description =
      '<strong>رف جداري مونتيسوري للأطفال ٥٣ × ١٩ × ١٢ سم – أبيض</strong><br>' +
      'رف جداري للأطفال مثالي لعرض الكتب والألعاب، ويشجع على حب القراءة والاعتماد على النفس.<br><br>' +
      '• الأبعاد: ٥٣ × ١٩ × ١٢ سم<br>' +
      '• أقصى حمولة: ٣ كغ<br>' +
      '• الرفوف: ١<br>' +
      '• المواد: صنوبر + ألواح مضغوطة<br>' +
      '• زوايا دائرية آمنة<br>' +
      '• مسامير ومثبتات مرفقة<br>' +
      '• تركيب سريع<br>' +
      '• تصميم عصري يناسب أي ديكور<br><br>' +
      'لون أبيض';
    const product = await prisma.product.update({
      where: { slug },
      data: { images: JSON.stringify(images), description, name: 'رف جداري مونتيسوري للأطفال ٥٣ × ١٩ × ١٢ سم – أبيض' }
    });
    return NextResponse.json({ ok: true, id: product.id });
  } catch (e) {
    return NextResponse.json({ ok: false, err: e.message }, { status: 500 });
  }
}
