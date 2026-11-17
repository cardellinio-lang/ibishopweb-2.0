import { CADRE_SLUG } from '@/lib/pricing';

// Description neutre affichée pour le cadre A4. La version en base contient
// encore une phrase sur le plexiglas : le build échoue parfois à lancer le seed
// (Neon, 15 connexions max). On filtre donc aussi à l'affichage, pour que le
// site ne dise jamais « plexiglas » ni « sécurité », même si le seed a été
// ignoré. Si l'admin remplace la description par un texte sans mention de
// matériau, c'est ce texte qui est respecté.
const SAFE_DESCRIPTION =
  "Joli encadrement pour dessins d'enfants format A4. Ouverture avant magnétique, rangement jusqu'à 200 dessins. Couleurs disponibles : Noir et effet Bois.";

const OLD_MATERIAL = /plexiglas|plexi|verre|bris|chocs|résistant|résistance|sécurité|بلكسي|زجاج/i;

export function displayDescription(product) {
  const raw = product?.description || '';
  if (product?.slug === CADRE_SLUG && OLD_MATERIAL.test(raw)) return SAFE_DESCRIPTION;
  return raw;
}
