import * as THREE from 'three';
import { canvasTexture, hashString, makeCanvas, noise, rng, shade, type Rng } from '../core/util';
import type { FacadeStyle } from './layout';

export interface FacadeParams {
  width: number; // metres along the street
  floors: number; // including the ground floor
  floorH: number;
  groundH: number;
  parapet: number;
  style: FacadeStyle;
  wall: string;
  trim: string;
  accent: string;
  shops: boolean;
  /** false for a set-back upper tier, which has no ground floor. */
  ground: boolean;
  /** Width in metres of a central entrance (cinema, hotel...) on the ground floor; 0 for none. */
  entranceW: number;
  ppm: number;
  r: Rng;
}

export interface ShopUnit {
  /** From the left edge as seen from the street, metres. */
  x: number;
  w: number;
}

export interface Facade {
  map: THREE.CanvasTexture;
  emissive: THREE.CanvasTexture;
  height: number;
  shopUnits: ShopUnit[];
  /** Bay centres (metres from the left) and the bay width, for 3D balconies. */
  bays: number[];
  bayW: number;
}

const EMISSIVE_SCALE = 0.25;

export function facadeHeight(floors: number, floorH: number, groundH: number, parapet: number) {
  return groundH + (floors - 1) * floorH + parapet;
}

const BAY_TARGET: Record<FacadeStyle, number> = { ribbon: 3.6, punched: 3.4, vertical: 2.8, grid: 3.0, curtain: 1.8, classic: 3.8 };

export function paintFacade(p: FacadeParams): Facade {
  const H = facadeHeight(p.floors, p.floorH, p.groundH, p.parapet);
  // keep textures within 2048 px
  const ppm = Math.min(p.ppm, 2048 / Math.max(p.width, H));
  const [c, ctx] = makeCanvas(p.width * ppm, H * ppm);
  const [ec, ectx] = makeCanvas(p.width * ppm * EMISSIVE_SCALE, H * ppm * EMISSIVE_SCALE);
  const r = p.r;
  const X = (m: number) => m * ppm;
  const Y = (mFromGround: number) => (H - mFromGround) * ppm; // canvas y of a height above ground
  ectx.fillStyle = '#000';
  ectx.fillRect(0, 0, ec.width, ec.height);

  // the wall
  ctx.fillStyle = p.wall;
  ctx.fillRect(0, 0, c.width, c.height);
  noise(ctx, 0, 0, c.width, c.height, r, 0.07);

  const bays = Math.max(2, Math.round(p.width / BAY_TARGET[p.style]));
  const bayW = p.width / bays;
  const bayCentres = Array.from({ length: bays }, (_, i) => (i + 0.5) * bayW);
  const floorBase = (i: number) => (i === 0 ? 0 : p.groundH + (i - 1) * p.floorH);

  /** A glazed opening: on the colour canvas glass with curtains/blinds, on the emissive canvas lit or dark. */
  const glass = (x: number, y: number, w: number, h: number, litChance = 0.32, kind: 'home' | 'shop' | 'office' = 'home') => {
    const px = X(x), py = Y(y + h), pw = X(w), ph = X(h);
    const g = ctx.createLinearGradient(0, py, 0, py + ph);
    const tint = r.pick(['#2b3a4a', '#33414d', '#27323d', '#3a4652', '#2f3b44']);
    g.addColorStop(0, shade(tint, 0.35));
    g.addColorStop(0.5, tint);
    g.addColorStop(1, shade(tint, -0.25));
    ctx.fillStyle = g;
    ctx.fillRect(px, py, pw, ph);
    if (kind === 'home') {
      const v = r.next();
      if (v < 0.3) {
        // net curtains
        ctx.fillStyle = `rgba(235,228,210,${0.5 + r.next() * 0.35})`;
        ctx.fillRect(px, py, pw, ph);
      } else if (v < 0.5) {
        // blinds part-way down
        const d = ph * (0.2 + r.next() * 0.7);
        ctx.fillStyle = r.pick(['#d9d2c2', '#b8a98f', '#8f8a80', '#e7e1d3']);
        ctx.fillRect(px, py, pw, d);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let yy = py + 2; yy < py + d; yy += 3) ctx.fillRect(px, yy, pw, 1);
      } else if (v < 0.58) {
        // a plant pot or an air-conditioner box
        ctx.fillStyle = r.chance(0.5) ? '#4f7a3a' : '#e8e8e4';
        ctx.fillRect(px + pw * 0.1, py + ph * 0.72, pw * 0.3, ph * 0.28);
      }
    } else if (kind === 'office' && r.chance(0.4)) {
      ctx.fillStyle = 'rgba(200,210,215,0.35)';
      ctx.fillRect(px, py, pw, ph * 0.3);
    }
    // frame
    ctx.strokeStyle = kind === 'shop' ? '#1d1d1d' : r.chance(0.7) ? '#f1eee6' : '#5b4630';
    ctx.lineWidth = Math.max(1, ppm * 0.06);
    ctx.strokeRect(px, py, pw, ph);
    if (kind === 'home' && pw > ppm * 0.9) {
      ctx.beginPath();
      ctx.moveTo(px + pw / 2, py);
      ctx.lineTo(px + pw / 2, py + ph);
      ctx.moveTo(px, py + ph * 0.3);
      ctx.lineTo(px + pw, py + ph * 0.3);
      ctx.stroke();
    }
    // emissive
    const lit = r.next() < litChance;
    if (lit) {
      ectx.fillStyle = kind === 'shop' ? '#fff3d6' : r.pick(['#ffd79a', '#ffcf8a', '#ffe7c0', '#d8e8ff', '#ffc070']);
      ectx.globalAlpha = kind === 'shop' ? 1 : 0.6 + r.next() * 0.4;
      ectx.fillRect(px * EMISSIVE_SCALE, py * EMISSIVE_SCALE, Math.max(1, pw * EMISSIVE_SCALE), Math.max(1, ph * EMISSIVE_SCALE));
      ectx.globalAlpha = 1;
    }
  };

  const hLine = (y: number, thickness: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, Y(y + thickness), c.width, X(thickness));
  };

  const firstUpper = 1;
  // ---------- upper floors by style ----------
  for (let f = firstUpper; f < p.floors; f++) {
    const b = floorBase(f);
    switch (p.style) {
      case 'ribbon': {
        const sillH = 0.9, winH = p.floorH - 1.35;
        const margin = Math.min(1.2, p.width * 0.04);
        const segW = (p.width - margin * 2) / Math.max(1, Math.round((p.width - margin * 2) / 1.3));
        for (let x = margin; x < p.width - margin - 0.01; x += segW) glass(x, b + sillH, segW, winH);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; // shadow under the band's lintel
        ctx.fillRect(X(margin), Y(b + sillH + winH), X(p.width - margin * 2), X(0.12));
        hLine(b + sillH - 0.1, 0.1, shade(p.wall, -0.12));
        break;
      }
      case 'punched': {
        const winW = bayW * 0.48, winH = p.floorH * 0.52;
        for (const cx of bayCentres) {
          glass(cx - winW / 2, b + 0.9, winW, winH);
          ctx.fillStyle = shade(p.trim, -0.05); // sill
          ctx.fillRect(X(cx - winW / 2 - 0.1), Y(b + 0.9), X(winW + 0.2), X(0.1));
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(X(cx - winW / 2), Y(b + 0.9 + winH + 0.1), X(winW), X(0.1));
        }
        hLine(b - 0.08, 0.16, shade(p.wall, 0.12)); // string course
        break;
      }
      case 'vertical': {
        const pierW = bayW * 0.3;
        for (const cx of bayCentres) {
          const x0 = cx - bayW / 2 + pierW / 2;
          const w = bayW - pierW;
          glass(x0, b + 0.75, w, p.floorH - 1.15);
          ctx.fillStyle = shade(p.accent, -0.1); // spandrel panel
          ctx.fillRect(X(x0), Y(b + 0.75), X(w), X(0.75));
        }
        break;
      }
      case 'grid': {
        const winW = bayW * 0.72, winH = p.floorH * 0.5;
        for (const cx of bayCentres) {
          ctx.fillStyle = p.accent;
          ctx.fillRect(X(cx - winW / 2), Y(b + 0.95), X(winW), X(0.85));
          glass(cx - winW / 2, b + 0.95, winW, winH);
        }
        hLine(b - 0.06, 0.12, shade(p.wall, -0.15));
        break;
      }
      case 'curtain': {
        const panel = p.width / bays;
        ctx.fillStyle = shade(p.accent, -0.2);
        ctx.fillRect(0, Y(b + p.floorH), c.width, X(p.floorH));
        for (let i = 0; i < bays; i++) glass(i * panel + 0.04, b + 0.95, panel - 0.08, p.floorH - 1.0, 0.45, 'office');
        hLine(b, 0.95, shade(p.accent, 0.05));
        break;
      }
      case 'classic': {
        const winW = bayW * 0.42, winH = p.floorH * 0.6;
        for (const [i, cx] of bayCentres.entries()) {
          const top = b + 0.8 + winH;
          if (f === 1 || (f === p.floors - 1 && p.floors > 3)) {
            // arched windows on the piano nobile and the attic
            ctx.fillStyle = shade(p.trim, -0.05);
            ctx.beginPath();
            ctx.arc(X(cx), Y(top), X(winW / 2 + 0.15), Math.PI, 0);
            ctx.fill();
          } else {
            ctx.fillStyle = p.trim; // little cornice above the window
            ctx.fillRect(X(cx - winW / 2 - 0.2), Y(top + 0.3), X(winW + 0.4), X(0.22));
            if (i % 2 === 0) {
              ctx.beginPath(); // triangular pediment
              ctx.moveTo(X(cx - winW / 2 - 0.2), Y(top + 0.3));
              ctx.lineTo(X(cx), Y(top + 0.75));
              ctx.lineTo(X(cx + winW / 2 + 0.2), Y(top + 0.3));
              ctx.fill();
            }
          }
          glass(cx - winW / 2, b + 0.8, winW, winH);
          ctx.fillStyle = p.trim;
          ctx.fillRect(X(cx - winW / 2 - 0.15), Y(b + 0.8), X(winW + 0.3), X(0.14));
        }
        // pilasters every other bay
        ctx.fillStyle = shade(p.wall, 0.08);
        for (let i = 0; i <= bays; i += 2) ctx.fillRect(X(i * bayW - 0.25), Y(b + p.floorH), X(0.5), X(p.floorH));
        hLine(b - 0.12, 0.24, p.trim);
        break;
      }
    }
  }

  // ---------- ground floor ----------
  const gh = p.groundH;
  const shopUnits: ShopUnit[] = [];
  if (!p.ground) {
    /* upper tier: no ground floor */
  } else if (p.style === 'classic') {
    // rusticated base
    ctx.fillStyle = shade(p.wall, -0.08);
    ctx.fillRect(0, Y(gh), c.width, X(gh));
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0.4; y < gh; y += 0.45) ctx.fillRect(0, Y(y), c.width, Math.max(1, X(0.04)));
  } else {
    ctx.fillStyle = shade(p.wall, -0.18);
    ctx.fillRect(0, Y(gh), c.width, X(gh));
  }
  if (p.ground) hLine(gh - 0.25, 0.3, p.trim);

  const entranceW = p.ground ? Math.min(p.entranceW, p.width - 2) : 0;
  const entX0 = (p.width - entranceW) / 2;
  if (entranceW > 0) {
    // a grand glazed entrance: lobby lit in the evening
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(X(entX0), Y(gh - 0.3), X(entranceW), X(gh - 0.3));
    for (let x = entX0 + 0.3; x < entX0 + entranceW - 0.5; x += 1.6) glass(x, 0.05, 1.4, gh - 0.9, 1, 'shop');
  }
  if (p.ground && p.shops) {
    const left = entranceW > 0 ? [[0.4, entX0 - 0.4], [entX0 + entranceW + 0.4, p.width - 0.4]] : [[0.4, p.width - 0.4]];
    for (const [a, bnd] of left) {
      const span = bnd - a;
      if (span < 3) continue;
      const n = Math.max(1, Math.round(span / r.range(6, 9)));
      const uw = span / n;
      for (let i = 0; i < n; i++) {
        const x = a + i * uw;
        shopUnits.push({ x: x + 0.25, w: uw - 0.5 });
        ctx.fillStyle = shade(p.wall, -0.35); // pier
        ctx.fillRect(X(x), Y(gh - 0.3), X(0.4), X(gh - 0.3));
        ctx.fillStyle = '#222'; // fascia band, the 3D sign goes over it
        ctx.fillRect(X(x + 0.4), Y(gh - 0.35), X(uw - 0.4), X(0.95));
        const doorW = 1.2;
        const doorX = x + 0.4 + (r.chance(0.5) ? 0.2 : uw - 0.4 - doorW - 0.4);
        glass(x + 0.5, 0.35, uw - 0.6, gh - 1.75, 0.95, 'shop');
        ctx.fillStyle = 'rgba(20,20,20,0.85)';
        ctx.fillRect(X(doorX), Y(gh - 1.4), X(doorW), X(gh - 1.4)); // door
        ctx.fillStyle = r.pick(['#ffffff22', '#ffe08a33', '#a0d8ff22']);
        ctx.fillRect(X(x + 0.6), Y(gh - 1.6), X(uw - 1), X(1.0)); // display goods glow
      }
    }
  } else if (p.ground && entranceW === 0) {
    // residential: plinth, a door, small windows
    ctx.fillStyle = shade(p.wall, -0.3);
    ctx.fillRect(0, Y(0.8), c.width, X(0.8));
    for (const [i, cx] of bayCentres.entries()) {
      if (i === Math.floor(bays / 2)) {
        ctx.fillStyle = '#3b2a1a';
        ctx.fillRect(X(cx - 0.8), Y(2.8), X(1.6), X(2.8));
      } else glass(cx - bayW * 0.25, 1.2, bayW * 0.5, gh - 2.2, 0.3);
    }
  }

  // ---------- parapet / attic ----------
  ctx.fillStyle = p.trim;
  ctx.fillRect(0, 0, c.width, X(p.parapet));
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, X(p.parapet), c.width, Math.max(1, X(0.08)));
  if (p.style === 'classic') {
    ctx.fillStyle = shade(p.trim, -0.15); // dentils
    for (let x = 0; x < p.width; x += 0.35) ctx.fillRect(X(x), X(p.parapet - 0.25), X(0.18), X(0.2));
  }

  // ---------- weathering: rain streaks and grime near the ground ----------
  for (let i = 0; i < Math.round(p.width / 3); i++) {
    const x = r.next() * c.width;
    const y = r.next() * c.height * 0.6;
    const len = c.height * (0.1 + r.next() * 0.4);
    const g = ctx.createLinearGradient(0, y, 0, y + len);
    g.addColorStop(0, 'rgba(40,35,30,0.12)');
    g.addColorStop(1, 'rgba(40,35,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, X(0.3 + r.next() * 0.8), len);
  }
  if (p.ground) {
    const grime = ctx.createLinearGradient(0, Y(1.2), 0, Y(0));
    grime.addColorStop(0, 'rgba(30,25,20,0)');
    grime.addColorStop(1, 'rgba(30,25,20,0.25)');
    ctx.fillStyle = grime;
    ctx.fillRect(0, Y(1.2), c.width, X(1.2));
  }

  return {
    map: canvasTexture(c),
    emissive: canvasTexture(ec),
    height: H,
    shopUnits,
    bays: bayCentres,
    bayW,
  };
}

// ---------- shared tiling textures ----------
const cache = new Map<string, THREE.Texture>();

/** Blind side wall (firewall): plaster with patches and stains, one tile = 4 m. */
export function firewallTexture(wall: string): THREE.Texture {
  const key = `fw:${wall}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = shade(wall, -0.08);
  ctx.fillRect(0, 0, 128, 128);
  const r = rng(hashString(wall));
  noise(ctx, 0, 0, 128, 128, r, 0.1, 900);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + r.next() * 0.05})`;
    ctx.fillRect(r.next() * 128, r.next() * 128, 20 + r.next() * 50, 10 + r.next() * 40);
  }
  const t = canvasTexture(c, { repeat: true });
  cache.set(key, t);
  return t;
}

/** Courtyard-side wall: one window per 3.2 m tile. */
export function backWallTexture(wall: string): THREE.Texture {
  const key = `bw:${wall}`;
  if (cache.has(key)) return cache.get(key)!;
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = shade(wall, -0.12);
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#2d3640';
  ctx.fillRect(20, 18, 24, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(20, 46, 24, 3);
  const t = canvasTexture(c, { repeat: true });
  cache.set(key, t);
  return t;
}

export function roofTexture(): THREE.Texture {
  const key = 'roof';
  if (cache.has(key)) return cache.get(key)!;
  const [c, ctx] = makeCanvas(128, 128);
  const r = rng(7);
  ctx.fillStyle = '#5d5b57';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1500; i++) {
    const v = 60 + r.next() * 60;
    ctx.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
    ctx.fillRect(r.next() * 128, r.next() * 128, 2, 2);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  for (let x = 0; x < 128; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  const t = canvasTexture(c, { repeat: true });
  cache.set(key, t);
  return t;
}

export function clearFacadeCache() {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
