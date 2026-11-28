// Offre spéciale « Cadre dessin enfant A4 ».
// Source unique de vérité pour éviter les écarts entre la page produit,
// la galerie d'accueil et l'enregistrement des commandes.
export const CADRE_SLUG = 'cadre-dessin-enfant-a4';

// Deux façades au choix. Le verre reste le prix d'appel (inchangé), le
// plexiglas est l'option premium (plus sûre, rendu plus plastique).
export const CADRE_FACADE_VERRE = 'verre';
export const CADRE_FACADE_PLEXI = 'plexi';

// Libellé client unique : « بلكسي » est toujours précisé par « بلاستيك شفاف ».
export const CADRE_PLEXI_LABEL = 'بلكسي (بلاستيك شفاف)';

// Intitulés des deux options affichées sur la fiche et dans les commandes.
export const CADRE_VERRE_FACADE_TITLE = 'إطار بواجهة زجاجية';
export const CADRE_PLEXI_FACADE_TITLE = 'إطار بواجهة بليكسي';

export const CADRE_BASE_PRICE = 2200;   // verre, 1 article
export const CADRE_OFFER_PRICE = 1900;  // verre, par article dès 2 (toutes couleurs)
export const CADRE_OFFER_QTY = 2;

export const CADRE_PLEXI_BASE_PRICE = 2600;  // plexi, 1 article
export const CADRE_PLEXI_OFFER_PRICE = 2250; // plexi, par article dès 2

// Libellés publics : on affiche le lot (2 pour 3 800 / 4 500 DA), pas le prix
// unitaire, pour éviter toute confusion. Les calculs restent sur le prix unitaire.
export const CADRE_OFFER_TOTAL = CADRE_OFFER_PRICE * CADRE_OFFER_QTY;
export const CADRE_SAVE_TOTAL = (CADRE_BASE_PRICE - CADRE_OFFER_PRICE) * CADRE_OFFER_QTY;
export const CADRE_PLEXI_OFFER_TOTAL = CADRE_PLEXI_OFFER_PRICE * CADRE_OFFER_QTY;
export const CADRE_PLEXI_SAVE_TOTAL = (CADRE_PLEXI_BASE_PRICE - CADRE_PLEXI_OFFER_PRICE) * CADRE_OFFER_QTY;

export const CADRE_FACADES = {
  [CADRE_FACADE_VERRE]: {
    basePrice: CADRE_BASE_PRICE,
    offerPrice: CADRE_OFFER_PRICE,
    offerTotal: CADRE_OFFER_TOTAL,
    saveTotal: CADRE_SAVE_TOTAL,
  },
  [CADRE_FACADE_PLEXI]: {
    basePrice: CADRE_PLEXI_BASE_PRICE,
    offerPrice: CADRE_PLEXI_OFFER_PRICE,
    offerTotal: CADRE_PLEXI_OFFER_TOTAL,
    saveTotal: CADRE_PLEXI_SAVE_TOTAL,
  },
};

// Une valeur inconnue (ancien page cache, requête bricolée) retombe sur le verre.
export function cadreFacade(facade) {
  return facade === CADRE_FACADE_PLEXI ? CADRE_FACADE_PLEXI : CADRE_FACADE_VERRE;
}

export function cadrePriceForQty(qty = 0, facade = CADRE_FACADE_VERRE) {
  const prices = CADRE_FACADES[cadreFacade(facade)];
  return Number(qty) >= CADRE_OFFER_QTY ? prices.offerPrice : prices.basePrice;
}

export function cadreTotalForQty(qty = 0, facade = CADRE_FACADE_VERRE) {
  const n = Math.max(0, Number(qty) || 0);
  return cadrePriceForQty(n, facade) * n;
}
