import { CADRE_SLUG } from '@/lib/pricing';

// Description de repli pour le cadre A4 si la base ne renvoie rien.
// Une seule façade est vendue : le plexiglas, présenté comme l'option la plus sûre.
const CADRE_FALLBACK_DESCRIPTION =
  "Joli encadrement pour dessins d'enfants format A4. Ouverture avant magnétique, rangement jusqu'à 200 dessins. Façade en plexiglas (بلاستيك شفاف) : la plus sûre pour les dessins d'enfants. Couleurs disponibles : Noir et effet Bois.";

// On respecte toujours le texte saisi dans l'admin : il n'est jamais écrasé.
export function displayDescription(product) {
  if (product?.description) return product.description;
  return product?.slug === CADRE_SLUG ? CADRE_FALLBACK_DESCRIPTION : '';
}
