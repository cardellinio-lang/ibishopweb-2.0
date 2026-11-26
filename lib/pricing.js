// Offre spéciale « Cadre dessin enfant A4 ».
// Source unique de vérité pour éviter les écarts entre la page produit,
// la galerie d'accueil et l'enregistrement des commandes.
export const CADRE_SLUG = 'cadre-dessin-enfant-a4';

// Une seule façade proposée : le plexiglas (بلاستيك شفاف), la plus sûre pour
// les dessins d'enfants. Les anciennes options ne sont plus commercialisées.
export const CADRE_PLEXI_LABEL = 'بلكسي (بلاستيك شفاف)';

export const CADRE_BASE_PRICE = 2600;  // plexi, 1 article
export const CADRE_OFFER_PRICE = 2250; // plexi, par article dès 2 (toutes couleurs)
export const CADRE_OFFER_QTY = 2;

// Libellé public : on affiche le lot (2 pour 4 500 DA), pas seulement le prix
// unitaire, pour éviter toute confusion. Les calculs restent sur le prix unitaire.
export const CADRE_OFFER_TOTAL = CADRE_OFFER_PRICE * CADRE_OFFER_QTY;
export const CADRE_SAVE_TOTAL = (CADRE_BASE_PRICE - CADRE_OFFER_PRICE) * CADRE_OFFER_QTY;

export function cadrePriceForQty(qty = 0) {
  return Number(qty) >= CADRE_OFFER_QTY ? CADRE_OFFER_PRICE : CADRE_BASE_PRICE;
}

export function cadreTotalForQty(qty = 0) {
  const n = Math.max(0, Number(qty) || 0);
  return cadrePriceForQty(n) * n;
}
