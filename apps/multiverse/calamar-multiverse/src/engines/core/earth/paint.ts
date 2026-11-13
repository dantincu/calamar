import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { MultiLineString, MultiPolygon, Polygon, Position } from 'geojson';
import { rng } from '../util';
import { CITIES } from './data/cities';
import { LAKES, LAND_BANDS, LIGHT_AREAS, PLATEAUS, RANGES, REGIONS, type LonLat } from './data/terrain';

/** One country from Natural Earth: its rings (outer and holes) as flat [lon, lat, lon, lat, ...] arrays. */
export interface CountryShape {
  name: string;
  polygons: Float64Array[][];
  bbox: [number, number, number, number];
  /** Where its name goes: the centre of its largest piece. */
  label: [number, number];
  areaKm2: number;
}

export interface WorldShapes {
  countries: CountryShape[];
  borders: Position[][];
  coast: Position[][];
}

const KM_PER_DEG = 111.32;

/** Label spots for countries whose largest piece has an awkward centre. [lon, lat] */
const LABEL_AT: Record<string, [number, number]> = {
  'United States of America': [-98.5, 39.5],
  Canada: [-102, 57],
  Russia: [95, 62],
  France: [2.5, 46.6],
  Norway: [9.5, 61.5],
  Indonesia: [113.5, -1],
  Malaysia: [102, 4],
  Chile: [-70.5, -31],
  Croatia: [16, 45.4],
  Vietnam: [105.8, 21],
  Japan: [138.5, 36.5],
  Denmark: [9.2, 56.1],
  Greece: [22, 39.5],
  Italy: [12.5, 42.8],
  'United Kingdom': [-2, 53.5],
  Philippines: [122, 12.5],
  'New Zealand': [172.5, -42],
  Antarctica: [30, -82],
};

export function decodeWorld(topo: Topology): WorldShapes {
  const obj = topo.objects.countries as GeometryCollection<{ name: string }>;
  const fc = feature(topo, obj);
  const countries: CountryShape[] = [];
  for (const f of fc.features) {
    const g = f.geometry as Polygon | MultiPolygon | null;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const polygons = polys.map((rings) => rings.map((ring) => Float64Array.from(ring.flat())));
    let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
    let best = -1, bestArea = 0, total = 0;
    const centres: [number, number][] = [];
    polygons.forEach((rings, i) => {
      const outer = rings[0];
      let a = 0, cx = 0, cy = 0;
      for (let j = 0; j < outer.length; j += 2) {
        const lon = outer[j], lat = outer[j + 1];
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        const k = (j + 2) % outer.length;
        const cross = lon * outer[k + 1] - outer[k] * lat;
        a += cross;
        cx += (lon + outer[k]) * cross;
        cy += (lat + outer[k + 1]) * cross;
      }
      a /= 2;
      centres.push(a !== 0 ? [cx / (6 * a), cy / (6 * a)] : [outer[0], outer[1]]);
      const latMid = centres[i][1];
      const km2 = Math.abs(a) * KM_PER_DEG * KM_PER_DEG * Math.cos((latMid * Math.PI) / 180);
      total += km2;
      if (km2 > bestArea) {
        bestArea = km2;
        best = i;
      }
    });
    const name = f.properties?.name ?? '';
    countries.push({
      name,
      polygons,
      bbox: [minLon, minLat, maxLon, maxLat],
      label: LABEL_AT[name] ?? centres[best] ?? [0, 0],
      areaKm2: total,
    });
  }
  const borders = (mesh(topo, obj, (a, b) => a !== b) as MultiLineString).coordinates;
  const coast = (mesh(topo, obj, (a, b) => a === b) as MultiLineString).coordinates;
  return { countries, borders, coast };
}

/** Even-odd point-in-polygon over a country's rings. */
export function countryAt(countries: CountryShape[], lon: number, lat: number): CountryShape | null {
  for (const c of countries) {
    const [x0, y0, x1, y1] = c.bbox;
    if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue;
    for (const rings of c.polygons) {
      let inside = false;
      for (const ring of rings) {
        for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
          const yi = ring[i + 1], yj = ring[j + 1];
          if (yi > lat !== yj > lat && lon < ((ring[j] - ring[i]) * (lat - yi)) / (yj - yi) + ring[i]) inside = !inside;
        }
      }
      if (inside) return c;
    }
  }
  return null;
}

// ---------------------------------------------------------------- drawing helpers

/** Adds a ring/line in equirectangular pixels, unwrapping across the antimeridian and repeating it if it spills over. */
function trace(path: Path2D, lonLat: ArrayLike<number> | LonLat[], W: number, closed: boolean) {
  const flat = Array.isArray(lonLat) && Array.isArray(lonLat[0]) ? (lonLat as LonLat[]).flat() : (lonLat as ArrayLike<number>);
  const n = flat.length / 2;
  if (n < 2) return;
  const xs = new Float64Array(n);
  let prev = flat[0], shift = 0, min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) {
    const lon = flat[i * 2];
    if (i > 0 && Math.abs(lon - prev) > 180) shift += lon > prev ? -360 : 360;
    prev = lon;
    xs[i] = lon + shift;
    if (xs[i] < min) min = xs[i];
    if (xs[i] > max) max = xs[i];
  }
  const k = W / 360;
  const offsets = [0];
  if (min < -180) offsets.push(360);
  if (max > 180) offsets.push(-360);
  for (const off of offsets) {
    for (let i = 0; i < n; i++) {
      const x = (xs[i] + off + 180) * k;
      const y = (90 - flat[i * 2 + 1]) * k;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    if (closed) path.closePath();
  }
}

function landPath(world: WorldShapes, W: number, only?: (c: CountryShape) => boolean): Path2D {
  const p = new Path2D();
  for (const c of world.countries) {
    if (only && !only(c)) continue;
    for (const rings of c.polygons) for (const ring of rings) trace(p, ring, W, true);
  }
  return p;
}

function linesPath(lines: Position[][], W: number): Path2D {
  const p = new Path2D();
  for (const l of lines) trace(p, l.flat(), W, false);
  return p;
}

function shapePath(pts: LonLat[], W: number, closed: boolean): Path2D {
  const p = new Path2D();
  trace(p, pts, W, closed);
  return p;
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: false })!];
}

function latGradient(ctx: CanvasRenderingContext2D, H: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (const [lat, col] of stops) g.addColorStop((90 - lat) / 180, col);
  return g;
}

function noiseTile(size: number, seed: number, amp: number): HTMLCanvasElement {
  const [c, ctx] = canvas(size, size);
  const img = ctx.createImageData(size, size);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r.next() - 0.5) * 2 * amp;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// ---------------------------------------------------------------- the maps

export interface EarthMaps {
  day: HTMLCanvasElement;
  night: HTMLCanvasElement;
  /** White over water, black over land: where the sun glints. */
  water: HTMLCanvasElement;
}

/**
 * Cuts a layer to the land with a single fill. Clipping each draw against the ~100k-point coastline
 * instead is what makes canvas painting crawl.
 */
function maskToLand(layer: CanvasRenderingContext2D, land: Path2D) {
  layer.globalCompositeOperation = 'destination-in';
  layer.globalAlpha = 1;
  layer.filter = 'none';
  layer.fillStyle = '#000';
  layer.fill(land);
  layer.globalCompositeOperation = 'source-over';
}

/** Blurs a canvas in one pass (canvas filters are costly, so each layer is blurred once). */
function blurred(src: HTMLCanvasElement, px: number): HTMLCanvasElement {
  const [c, ctx] = canvas(src.width, src.height);
  ctx.filter = `blur(${px}px)`;
  ctx.drawImage(src, 0, 0);
  return c;
}

/** A normally distributed sample (Box–Muller). */
function gauss(r: { next(): number }): number {
  return Math.sqrt(-2 * Math.log(1 - r.next())) * Math.cos(2 * Math.PI * r.next());
}

/** Walks along a polyline (unwrapped across the antimeridian) every `step` degrees. */
function alongRange(pts: LonLat[], step: number, fn: (lon: number, lat: number, nx: number, ny: number) => void) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    let x1 = pts[i + 1][0];
    const y1 = pts[i + 1][1];
    if (Math.abs(x1 - x0) > 180) x1 += x1 > x0 ? -360 : 360;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.ceil(len / step);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      fn(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, -(y1 - y0) / len, (x1 - x0) / len);
    }
  }
}

/** Paints the day map (W × W/2), the night lights (at most 4096 wide) and the water mask. */
export function paintEarth(world: WorldShapes, W: number): EarthMaps {
  const H = W / 2;
  const k = W / 360; // pixels per degree
  const land = landPath(world, W);

  // ---- soft layers at low resolution, scaled up: shallow seas, sea ice, climate, relief
  const SW = Math.min(2048, W);
  const SH = SW / 2;
  const sk = SW / 360;
  const soft = landPath(world, SW);

  // sea: depth by latitude, lighter shelves along the coasts, pack ice towards the poles
  const [shelf, shc] = canvas(SW, SH);
  shc.lineJoin = 'round';
  shc.strokeStyle = '#1a5577';
  shc.lineWidth = sk * 1.4;
  shc.stroke(soft);
  shc.strokeStyle = '#2a7392';
  shc.lineWidth = sk * 0.45;
  shc.stroke(soft);
  const [sea, sc] = canvas(SW, SH);
  sc.fillStyle = latGradient(sc, SH, [[90, '#1f3e57'], [60, '#11314f'], [30, '#0b2a4b'], [0, '#0a2748'], [-30, '#0b2a4b'], [-60, '#123250'], [-90, '#1f3e57']]);
  sc.fillRect(0, 0, SW, SH);
  sc.drawImage(blurred(shelf, sk * 0.35), 0, 0);
  const [ice, icc] = canvas(SW, SH);
  icc.fillStyle = latGradient(icc, SH, [[90, 'rgba(214,226,234,0.95)'], [81, 'rgba(214,226,234,0.9)'], [75, 'rgba(214,226,234,0)'], [-62, 'rgba(214,226,234,0)'], [-68, 'rgba(214,226,234,0.7)'], [-90, 'rgba(214,226,234,0.9)']]);
  icc.fillRect(0, 0, SW, SH);
  const ir = rng(5); // floes and leads to break up the edge, then blurred into one ragged margin
  for (let i = 0; i < 2500; i++) {
    const lat = ir.next() < 0.6 ? 72 + ir.next() * 10 : -(61 + ir.next() * 8);
    const lon = ir.next() * 360 - 180;
    icc.fillStyle = ir.next() < 0.55 ? `rgba(214,226,234,${0.2 + ir.next() * 0.4})` : `rgba(0,0,0,${0.15 + ir.next() * 0.35})`;
    icc.globalCompositeOperation = icc.fillStyle.startsWith('rgba(0') ? 'destination-out' : 'source-over';
    icc.beginPath();
    icc.ellipse((lon + 180) * sk, (90 - lat) * sk, sk * (0.3 + ir.next() * 1.5), sk * (0.15 + ir.next() * 0.5), ir.next() * Math.PI, 0, Math.PI * 2);
    icc.fill();
  }
  sc.drawImage(blurred(ice, sk * 0.25), 0, 0);

  // climate: latitude bands, then regions, all blurred together
  const [zones, zc] = canvas(SW, SH);
  zc.fillStyle = latGradient(zc, SH, LAND_BANDS);
  zc.fillRect(0, 0, SW, SH);
  for (const r of REGIONS) {
    zc.fillStyle = r.color;
    zc.fill(shapePath(r.pts, SW, true));
  }
  zc.globalAlpha = 0.75;
  for (const r of PLATEAUS) {
    zc.fillStyle = r.color;
    zc.fill(shapePath(r.pts, SW, true));
  }
  zc.globalAlpha = 1;
  const climate = blurred(zones, sk * 1.1);

  // relief: a dark band along each range...
  const [bands, bc] = canvas(SW, SH);
  bc.lineJoin = 'round';
  bc.lineCap = 'round';
  for (const r of RANGES) {
    bc.strokeStyle = r.h === 1 ? 'rgba(118, 102, 72, 0.45)' : r.h === 2 ? 'rgba(98, 84, 62, 0.6)' : 'rgba(88, 76, 64, 0.7)';
    bc.lineWidth = sk * r.w * 0.8;
    bc.stroke(shapePath(r.pts, SW, false));
  }
  // ...and patchy snow on the high ones
  const [snow, snc] = canvas(SW, SH);
  const sr = rng(31);
  for (const r of RANGES) {
    if (r.h === 1) continue;
    const flakes = new Path2D();
    alongRange(r.pts, 0.1, (lon, lat) => {
      const x = (lon + gauss(sr) * r.w * 0.12 + 180) * sk;
      const y = (90 - (lat + gauss(sr) * r.w * 0.12)) * sk;
      const rad = Math.max(0.6, sk * r.w * (0.04 + sr.next() * 0.06));
      flakes.moveTo(x + rad, y);
      flakes.arc(x, y, rad, 0, Math.PI * 2);
    });
    snc.fillStyle = r.h === 3 ? 'rgba(240, 242, 246, 0.75)' : 'rgba(240, 242, 246, 0.22)';
    snc.fill(flakes);
  }

  // ---- full-resolution day map: the sea, then one land layer masked once
  const [day, dc] = canvas(W, H);
  dc.imageSmoothingQuality = 'high';
  dc.drawImage(sea, 0, 0, W, H);

  const [landLayer, lc] = canvas(W, H);
  lc.imageSmoothingQuality = 'high';
  lc.drawImage(climate, 0, 0, W, H);
  lc.drawImage(blurred(bands, sk * 0.45), 0, 0, W, H);
  // ridges: short strokes across each range's spine, so mountains read as mountains up close
  const r = rng(77);
  const dark = new Path2D(), light = new Path2D();
  for (const range of RANGES) {
    alongRange(range.pts, 0.15, (lon, lat, nx, ny) => {
      const cx = lon + (r.next() - 0.5) * 0.25;
      const cy = lat + (r.next() - 0.5) * 0.25;
      const half = range.w * (0.2 + r.next() * 0.3);
      const tilt = (r.next() - 0.5) * 0.9;
      const ax = nx + tilt * ny, ay = ny - tilt * nx;
      const p = r.next() < 0.5 ? dark : light;
      p.moveTo((cx - ax * half + 180) * k, (90 - (cy - ay * half)) * k);
      p.lineTo((cx + ax * half + 180) * k, (90 - (cy + ay * half)) * k);
    });
  }
  lc.lineCap = 'round';
  lc.lineWidth = Math.max(1, k * 0.06);
  lc.strokeStyle = 'rgba(60, 50, 40, 0.28)';
  lc.stroke(dark);
  lc.strokeStyle = 'rgba(225, 220, 205, 0.16)';
  lc.stroke(light);
  lc.drawImage(blurred(snow, sk * 0.08), 0, 0, W, H);
  // grain at two scales
  lc.globalCompositeOperation = 'soft-light';
  lc.globalAlpha = 0.5;
  lc.fillStyle = lc.createPattern(noiseTile(256, 11, 60), 'repeat')!;
  lc.fillRect(0, 0, W, H);
  lc.setTransform(6, 0, 0, 6, 0, 0);
  lc.fillStyle = lc.createPattern(noiseTile(256, 12, 70), 'repeat')!;
  lc.fillRect(0, 0, W / 6, H / 6);
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalAlpha = 1;
  lc.globalCompositeOperation = 'source-over';
  // ice sheets
  lc.fillStyle = '#e4ebf0';
  lc.fill(landPath(world, W, (c) => c.name === 'Antarctica' || c.name === 'Greenland'));
  maskToLand(lc, land);
  dc.drawImage(landLayer, 0, 0);
  landLayer.width = landLayer.height = 0; // free it now

  // big lakes
  const lakes = new Path2D();
  for (const l of LAKES) trace(lakes, l, W, true);
  dc.fillStyle = '#17405f';
  dc.fill(lakes);

  // coastline and borders
  dc.lineJoin = 'round';
  dc.strokeStyle = 'rgba(8, 20, 32, 0.4)';
  dc.lineWidth = Math.max(1, k * 0.035);
  dc.stroke(linesPath(world.coast, W));
  dc.strokeStyle = 'rgba(255, 238, 200, 0.4)';
  dc.lineWidth = Math.max(0.8, k * 0.04);
  dc.stroke(linesPath(world.borders, W));

  // ---- night lights: towns scattered around each city and through the densely lit regions, cut to the land
  const NW = Math.min(W, 4096), NH = NW / 2, nk = NW / 360;
  const [night, nc] = canvas(NW, NH);
  const [dots, dtc] = canvas(NW, NH);
  const lr = rng(2024);
  const dotScale = Math.min(1.5, NW / 2048);
  const towns = new Path2D(), bright = new Path2D();
  const dot = (lon: number, lat: number, size: number, b: boolean) => {
    const s = Math.max(0.5, nk * size);
    (b ? bright : towns).rect((lon + 180) * nk - s, (90 - lat) * nk - s, s * 2, s * 2);
  };
  for (const [x0, y0, x1, y1, density] of LIGHT_AREAS) {
    // gaussian blobs rather than boxes: dense in the middle, thinning out towards the edges
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, sx = (x1 - x0) / 3.2, sy = (y1 - y0) / 3.2;
    const count = Math.round((x1 - x0) * (y1 - y0) * density * dotScale * 0.8);
    for (let i = 0; i < count; i++) dot(cx + gauss(lr) * sx, cy + gauss(lr) * sy, 0.03 + lr.next() * 0.05, lr.next() < 0.25);
  }
  for (const [, lat, lon, pop] of CITIES) {
    const spread = 0.25 + 0.35 * Math.sqrt(pop);
    const n = Math.round((20 + pop * 25) * dotScale);
    const stretch = 1 / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    for (let i = 0; i < n; i++) dot(lon + gauss(lr) * spread * stretch, lat + gauss(lr) * spread, 0.03 + lr.next() * 0.04, lr.next() < 0.4);
  }
  dtc.fillStyle = 'rgba(255, 196, 120, 0.3)';
  dtc.fill(towns);
  dtc.fillStyle = 'rgba(255, 220, 160, 0.6)';
  dtc.fill(bright);
  // soften the dots so they read as glows, not pixels, when seen from low orbit
  const softDots = blurred(dots, Math.max(0.6, nk * 0.04));
  maskToLand(softDots.getContext('2d')!, landPath(world, NW));
  nc.fillStyle = '#000';
  nc.fillRect(0, 0, NW, NH);
  nc.drawImage(softDots, 0, 0);
  nc.globalCompositeOperation = 'lighter';
  for (const [, lat, lon, pop] of CITIES) {
    const x = (lon + 180) * nk, y = (90 - lat) * nk;
    const rad = nk * (0.1 + 0.11 * Math.sqrt(pop));
    const g = nc.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, 'rgba(255, 240, 205, 1)');
    g.addColorStop(0.35, 'rgba(255, 200, 120, 0.7)');
    g.addColorStop(1, 'rgba(255, 170, 80, 0)');
    nc.fillStyle = g;
    nc.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  nc.globalCompositeOperation = 'source-over';

  // ---- water mask
  const MW = Math.min(2048, W / 2), MH = MW / 2;
  const [water, wc] = canvas(MW, MH);
  wc.fillStyle = '#fff';
  wc.fillRect(0, 0, MW, MH);
  wc.fillStyle = '#000';
  wc.fill(landPath(world, MW));
  wc.fillStyle = latGradient(wc, MH, [[90, '#000'], [79, '#000'], [75, 'rgba(0,0,0,0)'], [-64, 'rgba(0,0,0,0)'], [-68, '#000'], [-90, '#000']]);
  wc.fillRect(0, 0, MW, MH); // pack ice doesn't glint
  wc.fillStyle = '#fff';
  const ml = new Path2D();
  for (const l of LAKES) trace(ml, l, MW, true);
  wc.fill(ml);

  return { day, night, water };
}
