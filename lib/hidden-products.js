import prisma, { withDbRetry } from '@/lib/db';

// Clé Setting qui contient la liste (JSON) des slugs « masqués ».
// Un produit masqué n'apparaît plus dans la boutique (grille d'accueil) ni
// dans l'API publique /api/products, mais reste accessible via son lien
// direct /products/<slug> (utile pour les publicités). Réversible.
const KEY = 'hidden_product_slugs';

export async function getHiddenSlugs() {
  try {
    const s = await withDbRetry(() => prisma.setting.findUnique({ where: { key: KEY } }));
    if (!s?.value) return [];
    const arr = JSON.parse(s.value);
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string' && x) : [];
  } catch {
    return [];
  }
}
