import * as THREE from 'three';
import { canvasTexture, fitText, makeCanvas, shade } from '../core/util';

const cache = new Map<string, THREE.CanvasTexture>();

/** A shop fascia: coloured board with lettering. */
export function shopSignTexture(text: string, bg: string, fg: string): THREE.CanvasTexture {
  const key = `shop:${text}:${bg}:${fg}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, ctx] = makeCanvas(512, 80);
  const g = ctx.createLinearGradient(0, 0, 0, 80);
  g.addColorStop(0, shade(bg, 0.12));
  g.addColorStop(1, shade(bg, -0.15));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 80);
  ctx.strokeStyle = shade(bg, -0.4);
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 76);
  ctx.fillStyle = fg;
  fitText(ctx, text, 256, 42, 470, 50, 'Arial', '700');
  const t = canvasTexture(c);
  cache.set(key, t);
  return t;
}

/** Free-standing neon letters (transparent background). */
export function neonTexture(text: string, color: string, vertical = false): THREE.CanvasTexture {
  const key = `neon:${text}:${color}:${vertical}`;
  if (cache.has(key)) return cache.get(key)!;
  const letters = [...text];
  const [c, ctx] = vertical ? makeCanvas(128, 120 * letters.length + 20) : makeCanvas(Math.max(256, letters.length * 110), 160);
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.strokeStyle = shade(color, -0.5);
  ctx.lineWidth = 3;
  if (vertical) {
    letters.forEach((ch, i) => {
      ctx.font = `900 104px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, 64, 70 + i * 120);
      ctx.strokeText(ch, 64, 70 + i * 120);
    });
  } else {
    fitText(ctx, text, c.width / 2, 84, c.width - 20, 120, 'Arial', '900');
    ctx.strokeText(text, c.width / 2, 84);
  }
  const t = canvasTexture(c);
  cache.set(key, t);
  return t;
}

/** A solid board with lettering (marquees, theatre fascias, blades). */
export function boardTexture(text: string, bg: string, fg: string, vertical = false, aspect = 4): THREE.CanvasTexture {
  const key = `board:${text}:${bg}:${fg}:${vertical}:${aspect.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key)!;
  const letters = [...text];
  const [c, ctx] = vertical ? makeCanvas(128, Math.max(256, 128 * aspect)) : makeCanvas(Math.min(2048, 160 * aspect), 160);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg;
  ctx.shadowColor = fg;
  ctx.shadowBlur = 10;
  if (vertical) {
    const step = c.height / (letters.length + 0.5);
    letters.forEach((ch, i) => fitText(ctx, ch, 64, step * (i + 0.75), 110, step * 0.9, 'Arial', '900'));
  } else {
    fitText(ctx, text, c.width / 2, 84, c.width * 0.9, 110, 'Arial', '900');
  }
  const t = canvasTexture(c);
  cache.set(key, t);
  return t;
}

export function clearSignCache() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
