// Normalisation des URLs d'images : évite qu'une URL collée sans protocole
// (ex: "i.ibb.co/xxx.png") ou avec des espaces soit silencieusement ignorée.

export function normalizeImageUrl(value) {
  const s = (value || '').trim();
  if (!s) return '';
  if (s.startsWith('data:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  // domaine nu : on préfixe https://
  if (/^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(s)) return 'https://' + s.replace(/^\/+/, '');
  return '';
}

function toArray(images) {
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    const t = images.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? parsed : [t];
    } catch {
      return [t];
    }
  }
  return [];
}

export function cleanImages(images) {
  return JSON.stringify(toArray(images).map(normalizeImageUrl).filter(Boolean));
}
