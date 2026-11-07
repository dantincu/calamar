// scale.js: tonal scales (50 ... 950) whose steps are placed by contrast, not by guesswork.
//
// Every step has a target contrast ratio against white. Because WCAG contrast is a ratio of (Y + 0.05) terms,
// the contrast between two steps is the quotient of their targets:
//
//   CR(x, y) = CR(y, white) / CR(x, white)      (x lighter than y)
//
// so the targets below guarantee, for every hue:
//   600 and darker on white            >= 4.5   body text (AA)
//   500 and darker on white            >= 3     icons, input borders, large text
//   700 on 50                          >= 5.9   text on a tinted background
//   900 on 100                         >= 10
import { contrastRatio, cssOklch, maxChroma, oklchToRgb, parseHex, rgbToOklch, toHex } from './color.js';

export const CONTRAST_TARGETS = {
  50: 1.05, 100: 1.15, 200: 1.35, 300: 1.7, 400: 2.4, 500: 3.3,
  600: 4.6, 700: 6.2, 800: 8.5, 900: 11.5, 950: 14.5,
};

const WHITE = { r: 1, g: 1, b: 1 };

/**
 * Chroma at lightness l: the base chroma near the base color's lightness, tapering towards white and black
 * (C(l) = C0 * min(1, l(1-l) / (l0(1-l0)))), and never more than sRGB can show at that lightness and hue.
 */
export function chromaCurve(c0, l0, h) {
  const k = l0 * (1 - l0);
  return (l) => Math.min(c0 * Math.min(1, (l * (1 - l)) / k), maxChroma(l, h));
}

/**
 * The OKLCH lightness at which a color of hue h (and chroma chromaAt(l)) reaches `ratio` against `bg`.
 * Bisection: contrast grows steadily as the color moves away from the background's luminance.
 */
export function toneForContrast(h, chromaAt, bg, ratio, { darker = true } = {}) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const l = (lo + hi) / 2;
    const cr = contrastRatio(oklchToRgb({ l, c: chromaAt(l), h }), bg);
    const tooLittle = cr < ratio;
    // darker: lowering l raises contrast; lighter: raising l raises contrast
    if (darker === tooLittle) hi = l; else lo = l;
  }
  const l = darker ? lo : hi;
  return { l, c: chromaAt(l), h };
}

/** A full scale from one base color: [{ step, hex, oklch, contrastOnWhite }] */
export function generateScale(baseHex, targets = CONTRAST_TARGETS) {
  const base = rgbToOklch(parseHex(baseHex));
  const chromaAt = chromaCurve(base.c, base.l, base.h);
  return Object.entries(targets).map(([step, ratio]) => {
    const lch = toneForContrast(base.h, chromaAt, WHITE, ratio);
    const rgb = oklchToRgb(lch);
    return { step: Number(step), hex: toHex(rgb), oklch: cssOklch(lch), contrastOnWhite: contrastRatio(rgb, WHITE) };
  });
}

/** Neutrals: the same steps with a whisper of the brand hue (c around 0.01) so grays don't look dead next to it. */
export function neutralScale(hue, chroma = 0.012, targets = CONTRAST_TARGETS) {
  const chromaAt = (l) => Math.min(chroma, maxChroma(l, hue));
  return Object.entries(targets).map(([step, ratio]) => {
    const lch = toneForContrast(hue, chromaAt, WHITE, ratio);
    const rgb = oklchToRgb(lch);
    return { step: Number(step), hex: toHex(rgb), oklch: cssOklch(lch), contrastOnWhite: contrastRatio(rgb, WHITE) };
  });
}
