import { CADRE_PLEXI_LABEL } from '@/lib/pricing';

// Titres et descriptions SEO par produit.
// Objectif : les balises <title> / Open Graph doivent contenir les mots-clés
// que les clients tapent réellement (arabe), sans renommer les produits en base
// (ces noms servent à l'admin, aux commandes et aux notifications Telegram).
//
// Tout produit absent de ce fichier garde automatiquement son nom en base + « | IBI Kids ».
export const PRODUCT_SEO = {
  'cadre-dessin-enfant-a4': {
    title: 'إطار رسم للأطفال A4 — فتح مغناطيسي ويتسع لـ200 رسمة',
    description:
      `إطار أنيق لحفظ رسومات طفلك: فتح مغناطيسي، يتسع حتى 200 رسمة. اختر بين الواجهة الزجاجية (أجمل مظهر) وواجهة ${CADRE_PLEXI_LABEL}، الأكثر أماناً، بالأسود وبلون الخشب. الدفع عند الاستلام والتوصيل إلى 58 ولاية.`,
  },
};

export function productSeo(slug) {
  return PRODUCT_SEO[slug] || null;
}
