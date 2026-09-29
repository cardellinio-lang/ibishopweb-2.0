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

// Réduit l'image avant envoi (côté navigateur) : accélère l'upload et
// respecte les limites de l'hébergeur. Retourne un Blob, ou null si le
// navigateur ne sait pas traiter l'image (on garde alors l'original).
export async function compressImageFile(file, { maxSize = 1600, quality = 0.85 } = {}) {
  if (typeof document === 'undefined') return null;
  // Les GIF animés doivent rester des GIF
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return null;

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) return null;
  // Si la compression n'aide pas (image déjà légère), garder l'original
  if (blob.size >= file.size && file.size < 400_000) return null;

  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
