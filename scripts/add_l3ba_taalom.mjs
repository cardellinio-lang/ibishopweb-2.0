#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRODUCT = {
  name: 'لعبة تعلم اللغات التفاعلية للأطفال',
  slug: 'l3ba-taalom-loughat',
  price: 3500,
  oldPrice: 4500,
  color: '#8B5E3C',
  images: JSON.stringify([
    'https://images.pexels.com/photos/7334320/pexels-photo-7334320.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/17925153/pexels-photo-17925153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7334192/pexels-photo-7334192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8613101/pexels-photo-8613101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7335412/pexels-photo-7335412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ]),
  description: 'اكتشفوا وسيلة تعليمية مبتكرة تجمع بين المتعة والفائدة، مصممة خصيصاً لتنمية مهارات طفلكم اللغوية والحركية في آن واحد.<br><br><strong>مواصفات المنتج:</strong><br>• تصميم أنيق: يتميز المنتج بلمسة نهائية بلون خشبي جذاب يضفي طابعاً طبيعياً ودافئاً على غرفة طفلكم.<br>• محتويات غنية: تأتي اللعبة مع 104 بطاقات تعليمية متنوعة (إنجليزية وفرنسية) و78 حرفاً لتشكيل الكلمات.<br><br><strong>كيفية الاستخدام:</strong><br>• <strong>لوحة التشكيل (في الأعلى):</strong> تحتوي اللوحة على سكك مخصصة. قوموا بتركيب الحروف عليها لتكوين الكلمات المراد تعلمها، مما يساعد الطفل على الإمساك بالحروف وتنسيقها بصرياً.<br>• <strong>مساحة الكتابة (في الأسفل):</strong> ضعوا البطاقة التعليمية على الجزء الأيسر كمرجع للطفل. استخدموا الجزء الأيمن كـ سبورة قابلة للمسح ليتدرب الطفل على كتابة الكلمة بنفسه.<br>• <strong>تصميم قابل للطي:</strong> اللعبة مصممة لتكون قابلة للطي والحمل. عند قلب اللعبة أو إغلاقها، ستكتشفون في الخلف سبورة مخططة (للكتابة المدرسية)، مثالية لتدريب الطفل على مهارات الكتابة المتصلة (Cursive).<br><br><strong>لماذا ينصح الخبراء بهذه اللعبة؟</strong><br>تُعد هذه اللعبة موصى بها بشدة من قِبل أخصائيي تقويم النطق (الأورطوفونيين)، وهي مصممة خصيصاً لتحسين وتطوير عدة مهارات أساسية لطفلكم في آن واحد:<br>• المهارات الحركية الدقيقة وتنسيق حركة اليدين<br>• مهارات الكتابة<br>• قوة الملاحظة والتركيز<br>• تنمية الخيال<br>• إتقان الكتابة المتصلة (Cursive)<br><br>امنحوا طفلكم بداية تعليمية ممتعة، واجعلوا من وقت التعلم رحلة إبداعية لا تنتهي!',
  category: 'خشبية',
  stock: 50,
  tierEnabled: true,
  tierQty: 3,
  tierPrice: 2900,
  tierMessage: '➕ أضف {remaining} فقط ووفر 1800 د.ج على 3 قطع!',
  tierGift: '🎁 بطاقات إضافية مجانية',
};

async function main() {
  const existing = await prisma.product.findUnique({ where: { slug: PRODUCT.slug } });
  if (existing) {
    console.log(`Updating: ${PRODUCT.name}`);
    await prisma.product.update({ where: { slug: PRODUCT.slug }, data: PRODUCT });
  } else {
    console.log(`Creating: ${PRODUCT.name}`);
    await prisma.product.create({ data: PRODUCT });
  }
  console.log(`✅ ${PRODUCT.slug}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
