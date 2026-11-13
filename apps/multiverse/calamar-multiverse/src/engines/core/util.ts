import * as THREE from 'three';

/** Small, fast, seedable PRNG (mulberry32). Worlds must look the same on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min: number, max: number) => min + (max - min) * next(),
    int: (min: number, max: number) => Math.floor(min + (max - min + 1) * next()),
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  };
}
export type Rng = ReturnType<typeof rng>;

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return [c, c.getContext('2d')!];
}

export function canvasTexture(c: HTMLCanvasElement, opts: { repeat?: boolean; srgb?: boolean; anisotropy?: number } = {}): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = opts.anisotropy ?? 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** Shades a CSS hex colour: amount -1 (black) … 0 … +1 (white). */
export function shade(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  if (amount < 0) c.multiplyScalar(1 + amount);
  else c.lerp(new THREE.Color(1, 1, 1), amount);
  return `#${c.getHexString()}`;
}

/** Fills a rectangle with fine noise so flat surfaces don't look like plastic. */
export function noise(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: Rng, strength = 0.06, count = 0) {
  const n = count || Math.floor((w * h) / 18);
  for (let i = 0; i < n; i++) {
    const v = r.next();
    ctx.fillStyle = v < 0.5 ? `rgba(0,0,0,${strength * r.next()})` : `rgba(255,255,255,${strength * r.next()})`;
    ctx.fillRect(x + r.next() * w, y + r.next() * h, 1 + r.next() * 2, 1 + r.next() * 2);
  }
}

/** Draws text that fits the box, centred. */
export function fitText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number, maxH: number, font = 'Arial', weight = '700') {
  let size = maxH;
  ctx.font = `${weight} ${size}px ${font}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) size = (size * maxW) / w;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
}

/**
 * BoxGeometry whose faces are UV-mapped in metres / `tile` (so a repeating texture keeps its
 * scale on any box), except the faces listed in `unitFaces`, which keep 0…1 for a unique texture.
 * Face order (= material index): +x, -x, +y, -y, +z, -z.
 */
export function boxWithWorldUV(w: number, h: number, d: number, tile: number[] | number, unitFaces: number[] = []): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  const dims: [number, number][] = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    if (unitFaces.includes(f)) continue;
    const t = Array.isArray(tile) ? tile[f] : tile;
    const [fu, fv] = dims[f];
    for (let i = f * 4; i < f * 4 + 4; i++) uv.setXY(i, uv.getX(i) * (fu / t), uv.getY(i) * (fv / t));
  }
  uv.needsUpdate = true;
  return g;
}

/** Collects instance transforms + colours and turns them into one InstancedMesh. */
export class InstanceBatch {
  private matrices: THREE.Matrix4[] = [];
  private colors: THREE.Color[] = [];
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private geometry: THREE.BufferGeometry;
  private material: THREE.Material;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
    this.geometry = geometry;
    this.material = material;
  }

  add(x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rotY = 0, color?: THREE.ColorRepresentation, rotX = 0, rotZ = 0) {
    this.e.set(rotX, rotY, rotZ, 'YXZ');
    this.q.setFromEuler(this.e);
    this.m.compose(new THREE.Vector3(x, y, z), this.q, new THREE.Vector3(sx, sy, sz));
    this.matrices.push(this.m.clone());
    this.colors.push(new THREE.Color(color ?? 0xffffff));
  }

  get count() {
    return this.matrices.length;
  }

  build(opts: { castShadow?: boolean; receiveShadow?: boolean } = {}): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, Math.max(1, this.matrices.length));
    mesh.count = this.matrices.length;
    this.matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    this.colors.forEach((c, i) => mesh.setColorAt(i, c));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = opts.castShadow ?? true;
    mesh.receiveShadow = opts.receiveShadow ?? true;
    mesh.computeBoundingSphere();
    return mesh;
  }
}

/** Frees every geometry, material and texture under an object. */
export function disposeObject(root: THREE.Object3D) {
  const seen = new Set<unknown>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry && !seen.has(mesh.geometry)) {
      seen.add(mesh.geometry);
      mesh.geometry.dispose();
    }
    const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const m of mats) {
      if (seen.has(m)) continue;
      seen.add(m);
      for (const v of Object.values(m)) {
        if (v instanceof THREE.Texture && !seen.has(v)) {
          seen.add(v);
          v.dispose();
        }
      }
      m.dispose();
    }
  });
}
