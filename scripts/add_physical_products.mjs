#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const IMGBB_KEY = 'a8d77f4c5562a973f9c8ded591c2f637';
const PUBLIC = join(__dirname, '..', 'public', 'products');

async function uploadToImgbb(filePath) {
  const buf = readFileSync(filePath);
  const b64 = buf.toString('base64');
  const body = new URLSearchParams({ key: IMGBB_KEY, image: b64 });
  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`imgbb failed: ${JSON.stringify(data)}`);
  return data.data.url;
}

const PRODUCTS = [
  {
    name: 'بطاقات التذكير والتأنيث — الصفات والألوان',
    slug: 'cartes-masculin-feminin-couleurs',
    price: 180000, // 1800 DZD (in centimes/DA)
    oldPrice: 220000,
    color: '#7B1FA2',
    category: 'بطاقات علاج النطق',
    sku: 'KALAM-001',
    stock: 50,
    description: JSON.stringify([
      { type: 'heading', text: 'بطاقات التذكير والتأنيث — الصفات والألوان' },
      { type: 'text', text: 'مجموعة مكونة من 63 بطاقة مصممة بطريقة احترافية لتعليم الأطفال التمييز بين المذكر والمؤنث من خلال الصفات والألوان.' },
      { type: 'heading', text: 'المحتويات' },
      { type: 'list', items: [
        '63 بطاقة بحجم 8.2 × 11.6 سم مطبوعة على ورق مقوى 300 غرام',
        '7 ألوان: أحمر/حمراء، أخضر/خضراء، أزرق/زرقاء، أصفر/صفراء، أبيض/بيضاء، أسود/سوداء، برتقالي/بني/وردي',
        'كل بطاقة تعرض صفتين (مذكر + مؤنث) مع صور توضيحية',
        'تصميم احترافي مع ظلال وزوايا مدورة',
        'صندوق تخزين أنيق'
      ]},
      { type: 'heading', text: 'الفوائد' },
      { type: 'list', items: [
        'تنمية الوعي اللغوي والقواعدي عند الأطفال',
        'تقوية مهارة التمييز بين المذكر والمؤنث',
        'إثراء المفردات اللغوية',
        'مناسب للأطفال من 4 إلى 8 سنوات',
        'مثالي لجلسات التخاطب والعلاج اللغوي'
      ]},
      { type: 'heading', text: 'معلومات إضافية' },
      { type: 'text', text: 'البطاقات مغلفة بطبقة حماية شفافة لمقاومة التمزق والبلل. تأتي في صندوق كرتوني متين مناسـب للتخزين.' },
      { type: 'text', text: 'صنع في الجزائر — تصميم أصلي 100%' }
    ]),
    images: [],
  },
  {
    name: 'بطاقات الجمع والربط',
    slug: 'cartes-association',
    price: 220000,
    oldPrice: 270000,
    color: '#00695C',
    category: 'بطاقات علاج النطق',
    sku: 'KALAM-002',
    stock: 50,
    description: JSON.stringify([
      { type: 'heading', text: 'بطاقات الجمع والربط' },
      { type: 'text', text: 'مجموعة مكونة من 90 بطاقة لتنمية مهارات الربط والجمع بين الصور والكلمات. مصممة على الطريقة السويسرية لعلاج النطق.' },
      { type: 'heading', text: 'المحتويات' },
      { type: 'list', items: [
        '90 بطاقة بحجم 8.2 × 11.6 سم',
        '10 مواضيع: المزرعة، المطعم، الحديقة، السوق، المستشفى، المدرسة، حفلة، المطبخ، الحمام، الشارع',
        '3 صور لكل بطاقة لربط المفاهيم',
        'تصميم PRO مع أكواد ألوان لكل فئة',
        'صندوق تخزين فاخر'
      ]},
      { type: 'heading', text: 'الفوائد' },
      { type: 'list', items: [
        'تقوية مهارات الربط والتصنيف',
        'تنمية الذاكرة البصرية',
        'إثراء المفردات عبر 10 مجالات مختلفة',
        'مناسب للأطفال من 3 إلى 10 سنوات',
        'مثالي للاستخدام المنزلي والعيادات'
      ]},
      { type: 'text', text: 'صنع في الجزائر — تصميم أصلي 100%' }
    ]),
    images: [],
  },
  {
    name: 'بطاقات التحدي',
    slug: 'cartes-defi',
    price: 120000,
    oldPrice: 150000,
    color: '#E65100',
    category: 'بطاقات تحديات',
    sku: 'KALAM-003',
    stock: 50,
    description: JSON.stringify([
      { type: 'heading', text: 'بطاقات التحدي' },
      { type: 'text', text: '50 بطاقة تحدي لتنمية التفكير المنطقي واللغوي عند الأطفال. أسئلة وألغاز مصممة لتحفيز العقل بطريقة ممتعة.' },
      { type: 'heading', text: 'المحتويات' },
      { type: 'list', items: [
        '50 بطاقة مغلفة بطبقة حماية',
        'أسئلة منطقية ولغوية متنوعة',
        'مناسب للأطفال من 4 إلى 8 سنوات',
        'صندوق صغير أنيق'
      ]},
      { type: 'text', text: 'صنع في الجزائر — تصميم أصلي 100%' }
    ]),
    images: [],
  },
];

async function main() {
  console.log('Uploading mockups to imgbb...');
  const boxUrl = await uploadToImgbb(join(PUBLIC, 'box_mockup_main.jpg'));
  const spreadUrl = await uploadToImgbb(join(PUBLIC, 'cards_spread.jpg'));
  const closeupUrl = await uploadToImgbb(join(PUBLIC, 'card_closeup.jpg'));
  console.log('Uploaded:', { boxUrl, spreadUrl, closeupUrl });

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`Updating existing product: ${p.name}`);
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          ...p,
          images: JSON.stringify([boxUrl, spreadUrl, closeupUrl]),
        },
      });
    } else {
      console.log(`Creating product: ${p.name}`);
      await prisma.product.create({
        data: {
          ...p,
          images: JSON.stringify([boxUrl, spreadUrl, closeupUrl]),
        },
      });
    }
    console.log(`  ✓ ${p.slug}`);
  }

  console.log('\nDone! All products added/updated.');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
