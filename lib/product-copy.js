import { CADRE_SLUG } from '@/lib/pricing';

// Description de repli pour le cadre A4 si la base ne renvoie rien.
// Le détail des deux façades est affiché par le sélecteur dédié de la fiche ;
// ici on garde une phrase courte, lisible aussi dans le SEO.
const CADRE_FALLBACK_DESCRIPTION =
  "Joli encadrement pour dessins d'enfants format A4. Ouverture avant magnétique, rangement jusqu'à 200 dessins. Façade au choix : verre (rendu plus net) ou plexiglas (plus sûr). Couleurs disponibles : Noir et effet Bois.";

// On respecte toujours le texte saisi dans l'admin : il n'est plus écrasé
// lorsqu'il parle de verre ou de plexiglas (les deux façades sont proposées).
export function displayDescription(product) {
  if (product?.description) return product.description;
  return product?.slug === CADRE_SLUG ? CADRE_FALLBACK_DESCRIPTION : '';
}
