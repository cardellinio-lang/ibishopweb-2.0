// Offre spéciale « Cadre dessin enfant A4 ».
// Source unique de vérité pour éviter les écarts entre la page produit,
// la galerie d'accueil et l'enregistrement des commandes.
export const CADRE_SLUG = 'cadre-dessin-enfant-a4';
export const CADRE_BASE_PRICE = 2200;   // 1 article
export const CADRE_OFFER_PRICE = 1900;  // par article dès 2 articles (toutes couleurs)
export const CADRE_OFFER_QTY = 2;

// Libellés publics : on affiche le lot (2 pour 3 000 DA), pas le prix unitaire,
// pour éviter toute confusion. Les calculs, eux, restent sur le prix unitaire.
export const CADRE_OFFER_TOTAL = CADRE_OFFER_PRICE * CADRE_OFFER_QTY;
export const CADRE_SAVE_TOTAL = (CADRE_BASE_PRICE - CADRE_OFFER_PRICE) * CADRE_OFFER_QTY;

export function cadrePriceForQty(qty = 0) {
  return Number(qty) >= CADRE_OFFER_QTY ? CADRE_OFFER_PRICE : CADRE_BASE_PRICE;
}
