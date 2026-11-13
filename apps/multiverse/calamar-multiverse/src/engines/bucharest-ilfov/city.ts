import * as THREE from 'three';
import { InstanceBatch, canvasTexture, makeCanvas, noise, rng, shade, type Rng } from '../core/util';
import { AXIS_NORTH, AXIS_SOUTH, CROSS_STREETS, ROMANA_HALF, ROMANA_Z } from './layout';
import type { BuildKit } from './buildings';

const PAD_H = 0.12;
export const CITY_X = 1750;
export const CITY_Z_NORTH = -2900;
export const CITY_Z_SOUTH = 2700;
const CITY_Z_MID = (CITY_Z_NORTH + CITY_Z_SOUTH) / 2;
const CITY_Z_HALF = (CITY_Z_SOUTH - CITY_Z_NORTH) / 2;

/** Areas the generator must leave alone: [xMin, xMax, zMin, zMax]. */
export const RESERVED: [number, number, number, number][] = [
  [-100, 100, ROMANA_Z - ROMANA_HALF - 10, ROMANA_Z + ROMANA_HALF + 4], // Piața Romană
  [20, 92, -1008, -884], // ASE
  [24, 70, 645, 700], // InterContinental
  [88, 222, 642, 768], // Teatrul Național
  [-160, -92, -238, -188], // Biserica Amzei
  [42, 80, -235, -205], // Casa Dimitrie Sturdza
];

export const PARKS: { name: string; rect: [number, number, number, number]; lake?: [number, number, number, number] }[] = [
  { name: 'Grădina Icoanei', rect: [280, 410, -330, -238] },
  { name: 'Parcul Cișmigiu', rect: [-1020, -640, 420, 830], lake: [-900, -720, 560, 700] },
  { name: 'Grădina Ioanid', rect: [600, 700, -620, -520] },
];

const overlaps = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];

/** Accumulates walls and roofs of many simple buildings into two big geometries. */
class MergedBoxes {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  rpos: number[] = [];
  rnor: number[] = [];
  ruv: number[] = [];
  tpos: number[] = []; // pitched tile roofs
  tnor: number[] = [];

  private quad(p: number[], n: number[], u: number[] | null, a: number[], b: number[], c: number[], d: number[], normal: number[], uvs?: number[][]) {
    p.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i++) n.push(...normal);
    if (u && uvs) u.push(...uvs[0], ...uvs[1], ...uvs[2], ...uvs[0], ...uvs[2], ...uvs[3]);
  }

  /** Axis-aligned box from (x0, z0) to (x1, z1), height h; windows tile in `tileW` × `tileH` metres per texture repeat. */
  box(x0: number, x1: number, z0: number, z1: number, y0: number, h: number, tileW: number, tileH: number, uOffset: number, vOffset: number) {
    const y1 = y0 + h;
    const v0 = vOffset, v1 = vOffset + h / tileH;
    const wall = (ax: number, az: number, bx: number, bz: number, normal: number[]) => {
      const len = Math.hypot(bx - ax, bz - az);
      const u0 = uOffset, u1 = uOffset + len / tileW;
      this.quad(this.pos, this.nor, this.uv, [ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az], normal, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
    };
    wall(x0, z1, x1, z1, [0, 0, 1]); // south (+z)
    wall(x1, z1, x1, z0, [1, 0, 0]); // east
    wall(x1, z0, x0, z0, [0, 0, -1]); // north
    wall(x0, z0, x0, z1, [-1, 0, 0]); // west
    this.quad(this.rpos, this.rnor, this.ruv, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], [[x0 / 8, z1 / 8], [x1 / 8, z1 / 8], [x1 / 8, z0 / 8], [x0 / 8, z0 / 8]]);
  }

  /** A hip roof (pyramid-ish) over a box top at height y. */
  hip(x0: number, x1: number, z0: number, z1: number, y: number, rise: number) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const ridge = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? [[x0 + (z1 - z0) / 2, cz], [x1 - (z1 - z0) / 2, cz]] : [[cx, z0 + (x1 - x0) / 2], [cx, z1 - (x1 - x0) / 2]];
    const [ra, rb] = ridge;
    const top = y + rise;
    const tri = (a: number[], b: number[], c: number[]) => {
      const n = new THREE.Vector3().crossVectors(new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2])).normalize();
      this.tpos.push(...a, ...b, ...c);
      for (let i = 0; i < 3; i++) this.tnor.push(n.x, n.y, n.z);
    };
    const A = [x0, y, z1], B = [x1, y, z1], C = [x1, y, z0], D = [x0, y, z0];
    const RA = [ra[0], top, ra[1]], RB = [rb[0], top, rb[1]];
    if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) {
      tri(A, B, RB); tri(A, RB, RA); // south slope
      tri(C, D, RA); tri(C, RA, RB); // north slope
      tri(B, C, RB); // east
      tri(D, A, RA); // west
    } else {
      tri(B, C, RA); tri(B, RA, RB);
      tri(D, A, RB); tri(D, RB, RA);
      tri(A, B, RB);
      tri(C, D, RA);
    }
  }

  meshes(wallMat: THREE.Material, roofMat: THREE.Material, tileMat: THREE.Material): THREE.Mesh[] {
    const make = (p: number[], n: number[], u: number[] | null, m: THREE.Material) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
      if (u) g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2));
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    const out = [make(this.pos, this.nor, this.uv, wallMat), make(this.rpos, this.rnor, this.ruv, roofMat)];
    if (this.tpos.length) out.push(make(this.tpos, this.tnor, null, tileMat));
    return out;
  }
}

/** 8 × 8 windows per repeat, random curtains and lit windows; tile = 8·3.4 m × 8·3.2 m. */
function cityWallTextures(wall: string, accent: string | null, r: Rng): [THREE.CanvasTexture, THREE.CanvasTexture] {
  const cw = 34, ch = 32; // px per window cell
  const [c, ctx] = makeCanvas(cw * 8, ch * 8);
  const [e, ectx] = makeCanvas(8 * 4, 8 * 4);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, c.width, c.height);
  noise(ctx, 0, 0, c.width, c.height, r, 0.08);
  ectx.fillStyle = '#000';
  ectx.fillRect(0, 0, 32, 32);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * cw, y = row * ch;
      if (accent) {
        ctx.fillStyle = accent;
        ctx.fillRect(x + 4, y + 18, cw - 8, 12);
      }
      ctx.fillStyle = r.pick(['#2b3a4a', '#33414d', '#27323d', '#3d4852']);
      ctx.fillRect(x + 9, y + 6, cw - 18, 18);
      if (r.chance(0.3)) {
        ctx.fillStyle = 'rgba(230,222,205,0.6)';
        ctx.fillRect(x + 9, y + 6, cw - 18, 18);
      }
      ctx.fillStyle = shade(wall, 0.2);
      ctx.fillRect(x + 8, y + 24, cw - 16, 2);
      if (r.chance(0.3)) {
        ectx.fillStyle = r.pick(['#ffd79a', '#ffcf8a', '#ffe7c0', '#d8e8ff']);
        ectx.fillRect(col * 4 + 1, row * 4 + 1, 2, 2);
      }
    }
  }
  const map = canvasTexture(c, { repeat: true });
  const em = canvasTexture(e, { repeat: true });
  em.magFilter = THREE.NearestFilter;
  return [map, em];
}

function groundTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const r = rng(5);
  ctx.fillStyle = '#4a4b4d';
  ctx.fillRect(0, 0, 256, 256);
  noise(ctx, 0, 0, 256, 256, r, 0.12, 6000);
  return canvasTexture(c, { repeat: true });
}

/** Patchwork of Ilfov fields, villages and woods, one repeat = 4 km. */
function fieldsTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024, 1024);
  const r = rng(11);
  ctx.fillStyle = '#7c8a4e';
  ctx.fillRect(0, 0, 1024, 1024);
  const colors = ['#8f9b55', '#a3a35f', '#6f8a46', '#b8a86a', '#7d7046', '#5f7a3c', '#c2b27a', '#94a060', '#4f6b35'];
  for (let i = 0; i < 260; i++) {
    ctx.save();
    ctx.translate(r.next() * 1024, r.next() * 1024);
    ctx.rotate(r.range(-0.3, 0.3));
    ctx.fillStyle = r.pick(colors);
    ctx.fillRect(0, 0, r.range(30, 140), r.range(20, 90));
    ctx.restore();
  }
  // villages
  for (let i = 0; i < 8; i++) {
    const x = r.next() * 1024, y = r.next() * 1024;
    for (let k = 0; k < 60; k++) {
      ctx.fillStyle = r.pick(['#8c6f5a', '#a0522d', '#9a9a95', '#b5651d']);
      ctx.fillRect(x + r.range(-30, 30), y + r.range(-30, 30), 3, 3);
    }
  }
  // roads
  ctx.strokeStyle = '#6b6b66';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(r.next() * 1024, 0);
    ctx.lineTo(r.next() * 1024, 1024);
    ctx.stroke();
  }
  noise(ctx, 0, 0, 1024, 1024, r, 0.08, 20000);
  return canvasTexture(c, { repeat: true });
}

export interface City {
  windowMaterials: THREE.MeshStandardMaterial[];
  groundHeight(x: number, z: number): number;
  colliders: THREE.Box3[];
}

/** The Ilfov fields reach this far from the centre; beyond, the globe's coarse map takes over. */
export const ILFOV_RADIUS = 60000;
/** Inside this radius the ground is flat; further out it bends down with the Earth's curvature. */
const FLAT_RADIUS = 3200;
const EARTH_R = 6371000;

/** Height of the Ilfov ground at a distance from the centre: flat, then following the curvature. */
function ilfovHeight(d: number): number {
  return -0.3 - Math.max(0, d * d - FLAT_RADIUS * FLAT_RADIUS) / (2 * EARTH_R);
}

/** A disc of fields, curving down with the Earth and fading out at its rim. */
function ilfovCapGeometry(): THREE.BufferGeometry {
  const rings = 90, segs = 160;
  const radii: number[] = [0];
  for (let i = 1; i <= rings; i++) radii.push(400 * Math.pow(ILFOV_RADIUS / 400, (i - 1) / (rings - 1)));
  const pos: number[] = [], uv: number[] = [], col: number[] = [], idx: number[] = [];
  const tile = 4000; // one repeat of the fields texture
  radii.forEach((r, i) => {
    const n = i === 0 ? 1 : segs;
    const alpha = 1 - THREE.MathUtils.smoothstep(r / ILFOV_RADIUS, 0.55, 1);
    for (let s = 0; s < n; s++) {
      const a = (s / segs) * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      pos.push(x, ilfovHeight(r), z);
      uv.push(x / tile, -z / tile);
      col.push(1, 1, 1, alpha);
    }
  });
  for (let s = 0; s < segs; s++) idx.push(0, 1 + ((s + 1) % segs), 1 + s);
  for (let i = 1; i < rings; i++) {
    const a0 = 1 + (i - 1) * segs, b0 = 1 + i * segs;
    for (let s = 0; s < segs; s++) {
      const s1 = (s + 1) % segs;
      idx.push(a0 + s, a0 + s1, b0 + s, a0 + s1, b0 + s1, b0 + s);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

export function buildCity(kit: BuildKit): City {
  const r = rng(1459); // first documentary mention of Bucharest
  const g = kit.group;

  // ---------- ground: the city's asphalt, then Ilfov all the way to the horizon ----------
  const gt = groundTexture();
  gt.repeat.set((CITY_X * 2) / 12, (CITY_Z_SOUTH - CITY_Z_NORTH) / 12);
  const cityGeo = new THREE.CircleGeometry(1, 128);
  const cuv = cityGeo.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < cuv.count; i++) cuv.setXY(i, cuv.getX(i) * gt.repeat.x, cuv.getY(i) * gt.repeat.y);
  gt.repeat.set(1, 1);
  const city = new THREE.Mesh(cityGeo, new THREE.MeshStandardMaterial({ map: gt, roughness: 0.95 }));
  city.scale.set(CITY_X + 120, CITY_Z_HALF + 120, 1);
  city.rotation.x = -Math.PI / 2;
  city.position.set(0, 0, CITY_Z_MID);
  city.receiveShadow = true;
  g.add(city);
  const ilfov = new THREE.Mesh(ilfovCapGeometry(), new THREE.MeshStandardMaterial({ map: fieldsTexture(), roughness: 1, vertexColors: true, transparent: true }));
  ilfov.receiveShadow = true;
  g.add(ilfov);

  // ---------- street grid ----------
  const xLines: number[] = [];
  for (let x = 160; x < CITY_X; x += r.range(100, 125)) xLines.push(x, -x);
  xLines.sort((a, b) => a - b);
  const zLines: number[] = CROSS_STREETS.map((c) => c.z);
  const zSorted = [...zLines].sort((a, b) => a - b);
  for (let i = 0; i < zSorted.length - 1; i++) {
    const gap = zSorted[i + 1] - zSorted[i];
    if (gap > 150) zLines.push(zSorted[i] + gap / 2);
  }
  for (let z = zSorted[0] - 105; z > CITY_Z_NORTH; z -= r.range(95, 120)) zLines.push(z);
  for (let z = zSorted[zSorted.length - 1] + 105; z < CITY_Z_SOUTH; z += r.range(95, 120)) zLines.push(z);
  zLines.sort((a, b) => a - b);
  const xCols = [-CITY_X, ...xLines, CITY_X];

  const variants = [
    { wall: '#d6cbb5', accent: null },
    { wall: '#bdb7ab', accent: null },
    { wall: '#cfb488', accent: null },
    { wall: '#c8c4ba', accent: '#5a7a95' },
    { wall: '#b5aa98', accent: '#8a6a4f' },
  ];
  const builders = variants.map(() => new MergedBoxes());
  const pads = new MergedBoxes();
  const pads2: [number, number, number, number][] = [];
  const colliders: THREE.Box3[] = [];
  const trees = new InstanceBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }));
  const trunks = new InstanceBatch(new THREE.CylinderGeometry(0.15, 0.2, 1, 5), new THREE.MeshStandardMaterial({ color: '#5a4636', roughness: 1 }));
  const addTree = (x: number, z: number, s: number) => {
    const h = s * 1.2;
    trunks.add(x, h / 2, z, 1, h, 1);
    const col = new THREE.Color().setHSL(0.22 + r.next() * 0.1, 0.4 + r.next() * 0.2, 0.2 + r.next() * 0.1);
    trees.add(x, h + s * 0.6, z, s, s * 0.9, s, r.next() * 6, col);
  };

  const streetHalf = (zLine: number) => (CROSS_STREETS.find((c) => c.z === zLine)?.width ?? 11) / 2;
  for (let i = 0; i < zLines.length - 1; i++) {
    const zA = zLines[i] + streetHalf(zLines[i]);
    const zB = zLines[i + 1] - streetHalf(zLines[i + 1]);
    if (zB - zA < 25) continue;
    // along the axis, the boulevard's own buildings take the first 60 m on each side; beyond it, a 40 m avenue
    const axisHalf = zB > AXIS_NORTH && zA < AXIS_SOUTH ? 60 : 20;
    const cols: [number, number][] = [];
    for (let j = 0; j < xCols.length - 1; j++) {
      const xA = xCols[j] + (j === 0 ? 0 : 6);
      const xB = xCols[j + 1] - (j === xCols.length - 2 ? 0 : 6);
      if (xA < 0 && xB > 0) cols.push([xA, -axisHalf], [axisHalf, xB]);
      else cols.push([xA, xB]);
    }
    for (const [xA, xB] of cols) {
      if (xB - xA < 25) continue;
      const cxm = (xA + xB) / 2, czm = (zA + zB) / 2;
      // an irregular, roughly elliptical city edge
      const edge = (cxm / CITY_X) ** 2 + ((czm - CITY_Z_MID) / CITY_Z_HALF) ** 2;
      if (edge > 0.92 + 0.08 * Math.sin(Math.atan2(czm, cxm) * 7)) continue;
      const block: [number, number, number, number] = [xA, xB, zA, zB];
      const parkHere = PARKS.filter((p) => overlaps(block, p.rect)).map((p) => p.rect);
      pads.box(xA, xB, zA, zB, 0, PAD_H, 8, 8, 0, 0);
      pads2.push(block);
      const dist = Math.hypot((xA + xB) / 2, (zA + zB) / 2 - 0);
      // street trees along the block's edges (only near the centre, to keep the count sane)
      if (dist < 1100) {
        for (let x = xA + 6; x < xB - 3; x += 14) {
          if (r.chance(0.55)) addTree(x, zA - 2.5, r.range(2, 3));
          if (r.chance(0.55)) addTree(x, zB + 2.5, r.range(2, 3));
        }
      }
      // lots
      const nx = Math.max(1, Math.round((xB - xA) / r.range(22, 34)));
      const nz = Math.max(1, Math.round((zB - zA) / r.range(22, 34)));
      const lw = (xB - xA) / nx, lz = (zB - zA) / nz;
      for (let a = 0; a < nx; a++) {
        for (let b = 0; b < nz; b++) {
          // inner lots are often courtyards
          const inner = a > 0 && a < nx - 1 && b > 0 && b < nz - 1;
          if (inner && r.chance(0.6)) continue;
          const x0 = xA + a * lw + r.range(0.5, 3), x1 = xA + (a + 1) * lw - r.range(0.5, 3);
          const z0 = zA + b * lz + r.range(0.5, 3), z1 = zA + (b + 1) * lz - r.range(0.5, 3);
          const rect: [number, number, number, number] = [x0, x1, z0, z1];
          if (RESERVED.some((res) => overlaps(rect, res)) || parkHere.some((pr) => overlaps(rect, pr))) continue;
          const centre = Math.max(0, 1 - dist / 2600);
          const villa = r.chance(0.35 * (1 - centre) + 0.12);
          const floors = villa ? r.int(1, 3) : Math.round(r.range(3, 6) + centre * r.range(0, 7) + (r.chance(0.06) ? r.range(4, 9) : 0));
          const floorH = villa ? 3.6 : 3.2;
          const h = floors * floorH + 0.8;
          const vi = villa ? r.int(0, 2) : r.int(0, variants.length - 1);
          builders[vi].box(x0, x1, z0, z1, PAD_H, h, 3.4 * 8, 3.2 * 8, r.int(0, 7) / 8, r.int(0, 7) / 8);
          if (villa && r.chance(0.8)) builders[vi].hip(x0 - 0.4, x1 + 0.4, z0 - 0.4, z1 + 0.4, PAD_H + h, Math.min(x1 - x0, z1 - z0) * 0.32);
          colliders.push(new THREE.Box3(new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x1, PAD_H + h, z1)));
          if (inner || r.chance(0.15)) addTree((x0 + x1) / 2 + r.range(-3, 3), (z0 + z1) / 2, r.range(2.5, 4));
        }
      }
    }
  }

  // ---------- parks ----------
  const grassMat = new THREE.MeshStandardMaterial({ color: '#557d3b', roughness: 1 });
  const pathMat = new THREE.MeshStandardMaterial({ color: '#b9a98a', roughness: 1 });
  for (const p of PARKS) {
    const [x0, x1, z0, z1] = p.rect;
    const lawn = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0), grassMat);
    lawn.position.set((x0 + x1) / 2, 0.1, (z0 + z1) / 2);
    lawn.receiveShadow = true;
    g.add(lawn);
    // two crossing alleys
    const ax = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.22, 4), pathMat);
    ax.position.set((x0 + x1) / 2, 0.11, (z0 + z1) / 2 + (z1 - z0) * 0.12);
    const az = new THREE.Mesh(new THREE.BoxGeometry(4, 0.22, z1 - z0), pathMat);
    az.position.set((x0 + x1) / 2 - (x1 - x0) * 0.1, 0.11, (z0 + z1) / 2);
    ax.receiveShadow = az.receiveShadow = true;
    g.add(ax, az);
    if (p.lake) {
      const [lx0, lx1, lz0, lz1] = p.lake;
      const lake = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.1, 48), new THREE.MeshStandardMaterial({ color: '#3f6f7f', roughness: 0.08, metalness: 0.3 }));
      lake.scale.set((lx1 - lx0) / 2, 1, (lz1 - lz0) / 2);
      lake.position.set((lx0 + lx1) / 2, 0.23, (lz0 + lz1) / 2);
      g.add(lake);
    }
    const area = (x1 - x0) * (z1 - z0);
    for (let i = 0; i < area / 90; i++) {
      const x = r.range(x0 + 3, x1 - 3), z = r.range(z0 + 3, z1 - 3);
      if (p.lake && x > p.lake[0] && x < p.lake[1] && z > p.lake[2] && z < p.lake[3]) continue;
      addTree(x, z, r.range(3, 6));
    }
    kit.label(p.name, undefined, new THREE.Vector3((x0 + x1) / 2, 18, (z0 + z1) / 2), 'park', 1500);
  }

  // ---------- materials ----------
  const windowMaterials: THREE.MeshStandardMaterial[] = [];
  const roofMat = new THREE.MeshStandardMaterial({ color: '#6a6862', roughness: 1 });
  const tileMat = new THREE.MeshStandardMaterial({ color: '#8e4a32', roughness: 0.9, side: THREE.DoubleSide });
  variants.forEach((v, i) => {
    const [map, em] = cityWallTextures(v.wall, v.accent, r);
    const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.9 });
    windowMaterials.push(m);
    g.add(...builders[i].meshes(m, roofMat, tileMat));
  });
  const padMat = new THREE.MeshStandardMaterial({ color: '#8f8b84', roughness: 1 });
  for (const m of pads.meshes(padMat, padMat, padMat)) {
    m.castShadow = false;
    g.add(m);
  }
  g.add(trees.build(), trunks.build());

  // pad lookup for ground height
  const cell = 100;
  const grid = new Map<string, [number, number, number, number][]>();
  for (const p of pads2) {
    for (let cx = Math.floor(p[0] / cell); cx <= Math.floor(p[1] / cell); cx++) {
      for (let cz = Math.floor(p[2] / cell); cz <= Math.floor(p[3] / cell); cz++) {
        const k = `${cx},${cz}`;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k)!.push(p);
      }
    }
  }

  return {
    windowMaterials,
    colliders,
    groundHeight(x: number, z: number) {
      const d = Math.hypot(x, z);
      if (d > ILFOV_RADIUS * 0.8) return -Infinity; // the fading rim and beyond: the globe is the floor
      if (d > FLAT_RADIUS) return ilfovHeight(d);
      const list = grid.get(`${Math.floor(x / cell)},${Math.floor(z / cell)}`);
      if (list?.some((p) => x >= p[0] && x <= p[1] && z >= p[2] && z <= p[3])) return PAD_H;
      return 0;
    },
  };
}
