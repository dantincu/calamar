// color.js: the color math used throughout the course, with no dependencies.
// Colors are plain objects: { r, g, b } with channels in 0..1 (gamma-encoded sRGB, what hex codes store),
// { l, a, b } for OKLab and { l, c, h } for OKLCH (h in degrees).
//
//   import { parseHex, contrastRatio } from './color.js';
//   contrastRatio(parseHex('#2b59c3'), parseHex('#ffffff')); // 6.33

// ---------- hex <-> sRGB ----------

/** '#2b59c3', '2b59c3' or '#25c' -> { r, g, b } in 0..1 */
export function parseHex(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a hex color: ${hex}`);
  const n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

/** { r, g, b } in 0..1 -> '#rrggbb' (channels are clamped, then rounded to 8 bits) */
export function toHex({ r, g, b }) {
  const byte = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

// ---------- the sRGB transfer function ----------

/** gamma-encoded channel -> linear light (IEC 61966-2-1) */
export function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** linear light -> gamma-encoded channel */
export function fromLinear(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

// ---------- luminance and contrast (WCAG 2.x) ----------

/** relative luminance Y = 0.2126 R + 0.7152 G + 0.0722 B, on linear channels */
export function luminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** (Y_lighter + 0.05) / (Y_darker + 0.05): from 1 (no contrast) to 21 (black on white) */
export function contrastRatio(x, y) {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** which WCAG 2.2 levels a text/background pair passes */
export function wcagLevels(ratio) {
  return {
    aaText: ratio >= 4.5,      // body text (1.4.3)
    aaLargeText: ratio >= 3,   // >= 24px, or >= 18.66px bold (1.4.3)
    aaNonText: ratio >= 3,     // icons, borders of inputs, focus rings (1.4.11)
    aaaText: ratio >= 7,       // 1.4.6
    aaaLargeText: ratio >= 4.5,
  };
}

// ---------- HSL (CSS Color 4) ----------

/** { r, g, b } -> { h (degrees), s (0..1), l (0..1) } */
export function rgbToHsl({ r, g, b }) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return { h: (h + 360) % 360, s, l };
}

/** { h, s, l } -> { r, g, b } */
export function hslToRgb({ h, s, l }) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

// ---------- OKLab and OKLCH (Björn Ottosson, 2020) ----------

/** gamma-encoded sRGB -> OKLab */
export function rgbToOklab({ r, g, b }) {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    l: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

/** OKLab -> gamma-encoded sRGB (may fall outside 0..1: see inGamut) */
export function oklabToRgb({ l: L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  };
}

export function oklabToOklch({ l, a, b }) {
  const c = Math.hypot(a, b);
  const h = c < 1e-7 ? 0 : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return { l, c, h };
}

export function oklchToOklab({ l, c, h }) {
  const rad = h * Math.PI / 180;
  return { l, a: c * Math.cos(rad), b: c * Math.sin(rad) };
}

export const rgbToOklch = (rgb) => oklabToOklch(rgbToOklab(rgb));

/** true when every channel is inside 0..1 (with a tiny tolerance for rounding) */
export function inGamut({ r, g, b }, eps = 1e-6) {
  return [r, g, b].every((x) => x >= -eps && x <= 1 + eps);
}

/**
 * OKLCH -> sRGB. Colors outside the sRGB gamut keep their lightness and hue and lose chroma, found by bisection:
 * the largest C' <= C for which (L, C', h) still fits.
 */
export function oklchToRgb({ l, c, h }) {
  if (l >= 1) return { r: 1, g: 1, b: 1 };
  if (l <= 0) return { r: 0, g: 0, b: 0 };
  let rgb = oklabToRgb(oklchToOklab({ l, c, h }));
  if (inGamut(rgb)) return rgb;
  let lo = 0, hi = c;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToRgb(oklchToOklab({ l, c: mid, h })))) lo = mid; else hi = mid;
  }
  rgb = oklabToRgb(oklchToOklab({ l, c: lo, h }));
  return { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) };
}

/** the largest chroma that sRGB can show at this lightness and hue */
export function maxChroma(l, h) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToRgb(oklchToOklab({ l, c: mid, h })))) lo = mid; else hi = mid;
  }
  return lo;
}

/** ΔE_OK: Euclidean distance in OKLab. About 0.02 is the smallest difference most people notice. */
export function deltaEOK(x, y) {
  const p = rgbToOklab(x), q = rgbToOklab(y);
  return Math.hypot(p.l - q.l, p.a - q.a, p.b - q.b);
}

// ---------- transparency ----------

/** what the browser shows for color `fg` with opacity `alpha` over an opaque `bg` (per channel, as CSS composites) */
export function over(fg, alpha, bg) {
  const mix = (f, b) => alpha * f + (1 - alpha) * b;
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b) };
}

export function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

/** CSS for an OKLCH color, e.g. 'oklch(55.2% 0.162 262.4)' */
export function cssOklch({ l, c, h }) {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}
