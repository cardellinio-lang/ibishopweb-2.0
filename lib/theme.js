// Thème visuel des pages produit.
// Une couleur d'accent par produit, choisie dans l'admin ou extraite
// automatiquement des images du produit pour rester homogène avec elles.

export function normalizeHex(input) {
  if (!input || typeof input !== 'string') return null;
  let h = input.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return '#' + h.toLowerCase();
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex) || '#184391';
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Luminance perceptuelle (0 = noir, 1 = blanc).
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function saturation(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

// Mélange linéaire : t = 0 → a, t = 1 → b.
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

// Assombrit une couleur jusqu'à une luminance maximale (lisibilité sur fond blanc).
function shadeToLuminance(hex, maxLum, step = 10) {
  let out = normalizeHex(hex) || '#184391';
  let guard = 0;
  while (luminance(out) > maxLum && guard++ < 30) {
    const { r, g, b } = hexToRgb(out);
    out = rgbToHex({ r: r - step, g: g - step, b: b - step });
  }
  return out;
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3) * 255;
  const g = hue2rgb(p, q, h) * 255;
  const b = hue2rgb(p, q, h - 1 / 3) * 255;
  return { r, g, b };
}

// Rend une couleur d'image exploitable comme accent : assez saturée,
// ni trop claire ni trop sombre.
export function tuneAccent(hex) {
  const base = normalizeHex(hex);
  if (!base) return null;
  const { h, s, l } = rgbToHsl(hexToRgb(base));
  return rgbToHex(hslToRgb({
    h,
    s: Math.max(s, 0.48),
    l: Math.min(0.55, Math.max(0.34, l)),
  }));
}

// Toutes les valeurs dérivées utilisées par la page produit.
export function themeTokens(hex) {
  const accent = normalizeHex(hex) || '#184391';
  const text = shadeToLuminance(accent, 0.40);
  return {
    accent,
    text,
    cta: shadeToLuminance(accent, 0.42, 12),
    soft: mix(accent, '#ffffff', 0.90),
    softStrong: mix(accent, '#ffffff', 0.78),
    border: mix(accent, '#ffffff', 0.60),
    borderStrong: mix(accent, '#ffffff', 0.32),
  };
}

// --- Extraction des couleurs d'une image (navigateur uniquement) ----------

function loadImageData(url, size = 56) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('image non lisible'));
    img.src = url;
  });
}

function paletteFromPixels(data) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum > 0.95 || lum < 0.05) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.14) continue;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    e.r += r; e.g += g; e.b += b; e.n += 1;
    buckets.set(key, e);
  }
  const scored = [...buckets.values()]
    .filter((e) => e.n >= 6)
    .map((e) => {
      const hex = rgbToHex({ r: e.r / e.n, g: e.g / e.n, b: e.b / e.n });
      const sat = saturation(hex);
      const lum = luminance(hex);
      // Fréquence + vivacité, en évitant les teintes trop pâles ou trop sombres.
      const score = e.n * (0.5 + 1.6 * sat) * (1 - Math.abs(lum - 0.5) * 0.9);
      return { hex: tuneAccent(hex), score };
    })
    .filter((x) => x.hex)
    .sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  for (const { hex } of scored) {
    if (seen.has(hex)) continue;
    seen.add(hex);
    out.push(hex);
    if (out.length >= 6) break;
  }
  return out;
}

// Renvoie jusqu'à 6 couleurs dominantes tirées des images (dans l'ordre).
export async function paletteFromImages(urls = [], maxImages = 3) {
  if (typeof document === 'undefined') return [];
  const list = (urls || []).filter((u) => typeof u === 'string' && u.trim()).slice(0, maxImages);
  for (const url of list) {
    try {
      const data = await loadImageData(url);
      const palette = paletteFromPixels(data);
      if (palette.length) return palette;
    } catch {
      // image protégée par CORS : on tente la suivante
    }
  }
  return [];
}

// Couleur d'accent automatique, ou null si aucune image exploitable.
export async function autoThemeFromImages(urls = []) {
  const palette = await paletteFromImages(urls);
  return palette[0] || null;
}
