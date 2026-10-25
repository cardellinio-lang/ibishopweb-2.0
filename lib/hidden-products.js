import prisma, { withDbRetry } from '@/lib/db';

// Clé Setting qui contient la liste (JSON) des slugs « masqués ».
// Un produit masqué n'apparaît plus dans la boutique (grille d'accueil) ni
// dans l'API publique /api/products, mais reste accessible via son lien
// direct /products/<slug> (utile pour les publicités). Réversible.
const KEY = 'hidden_product_slugs';

// Masquage forcé pour recentrer sur orthophonie / jeux ludiques / éducatifs
const HARD_HIDDEN = [
  'chaussure-cuir-marron',
  'chaussette-orthopedique',
  'baskets-orthopediques',
  'mocassin-orthopedique',
  'pantoufle-orthopedique',
];

export async function getHiddenSlugs() {
  try {
    const s = await withDbRetry(() => prisma.setting.findUnique({ where: { key: KEY } }));
    let dbHidden = [];
    if (s?.value) {
      const arr = JSON.parse(s.value);
      dbHidden = Array.isArray(arr) ? arr.filter(x => typeof x === 'string' && x) : [];
    }
    const all = [...new Set([...dbHidden, ...HARD_HIDDEN])];
    return all;
  } catch {
    return HARD_HIDDEN;
  }
}
