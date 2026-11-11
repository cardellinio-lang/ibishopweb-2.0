// Offre spéciale « Cadre dessin enfant A4 ».
// Source unique de vérité pour éviter les écarts entre la page produit,
// la galerie d'accueil et l'enregistrement des commandes.
export const CADRE_SLUG = 'cadre-dessin-enfant-a4';
export const CADRE_BASE_PRICE = 2900;   // 1 article
export const CADRE_OFFER_PRICE = 2500;  // par article dès 2 articles (toutes couleurs)
export const CADRE_OFFER_QTY = 2;

export function cadrePriceForQty(qty = 0) {
  return Number(qty) >= CADRE_OFFER_QTY ? CADRE_OFFER_PRICE : CADRE_BASE_PRICE;
}
