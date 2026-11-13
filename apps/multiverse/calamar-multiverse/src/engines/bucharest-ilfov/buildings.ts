import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { InstanceBatch, boxWithWorldUV, hashString, rng, shade } from '../core/util';
import { FRONT_X, SHOP_NAMES, type BuildingSpec, type FacadeStyle, type Tier } from './layout';
import { backWallTexture, facadeHeight, firewallTexture, paintFacade, roofTexture } from './facade';
import { boardTexture, neonTexture, shopSignTexture } from './signs';

/** Shared state while building: batches of instanced details and the lists the world updates later. */
export class BuildKit {
  readonly group = new THREE.Group();
  readonly colliders: THREE.Box3[] = [];
  /** Facade materials whose emissive (lit windows) follows the time of day. */
  readonly windowMaterials: THREE.MeshStandardMaterial[] = [];
  /** Neon signs and lamps, brighter at night. */
  readonly neonMaterials: THREE.MeshStandardMaterial[] = [];
  /** Street surfaces that pick up a warm glow from the lamps at night. */
  readonly lampLit: THREE.MeshStandardMaterial[] = [];
  readonly labels: CSS2DObject[] = [];

  private unitBox = new THREE.BoxGeometry(1, 1, 1);
  private unitCyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
  private white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  private metal = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.6 });
  private awningMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide });

  readonly trim = new InstanceBatch(this.unitBox, this.white);
  readonly slabs = new InstanceBatch(this.unitBox, this.white);
  readonly rails = new InstanceBatch(this.unitBox, this.metal);
  readonly awnings = new InstanceBatch(this.unitBox, this.awningMat);
  readonly roofBoxes = new InstanceBatch(this.unitBox, this.white);
  readonly roofCyl = new InstanceBatch(this.unitCyl, this.metal);

  private matCache = new Map<string, THREE.Material>();

  material(key: string, make: () => THREE.Material): THREE.Material {
    let m = this.matCache.get(key);
    if (!m) {
      m = make();
      this.matCache.set(key, m);
    }
    return m;
  }

  addMesh(mesh: THREE.Mesh, collide = true) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);
    if (collide) {
      mesh.updateMatrixWorld(true);
      this.colliders.push(new THREE.Box3().setFromObject(mesh));
    }
  }

  /** A floating name tag; shown only within `maxDist` metres of the camera. */
  label(text: string, sub: string | undefined, pos: THREE.Vector3, kind = '', maxDist = 450) {
    const div = document.createElement('div');
    div.className = `world-label ${kind}`;
    div.textContent = text;
    if (sub) {
      const s = document.createElement('small');
      s.textContent = sub;
      div.appendChild(s);
    }
    const o = new CSS2DObject(div);
    o.position.copy(pos);
    o.userData.maxDist = maxDist;
    this.group.add(o);
    this.labels.push(o);
    return o;
  }

  /** Turns the batches into instanced meshes. Call once, after every building is added. */
  finish() {
    for (const b of [this.trim, this.slabs, this.rails, this.awnings, this.roofBoxes, this.roofCyl]) {
      if (b.count) this.group.add(b.build());
    }
  }
}

const AWNING_COLORS = ['#a4161a', '#1d3557', '#2a9d8f', '#e9c46a', '#6d597a', '#264653', '#bc6c25', '#3a5a40', '#7f5539'];
const SIGN_COLORS: [string, string][] = [
  ['#0b3d91', '#ffffff'], ['#b5172b', '#ffffff'], ['#1b4332', '#f1faee'], ['#f1faee', '#1d3557'], ['#111111', '#ffd166'],
  ['#ffd166', '#111111'], ['#6a040f', '#ffe8d6'], ['#2b2d42', '#edf2f4'], ['#e76f51', '#ffffff'], ['#00798c', '#ffffff'],
];

export function addBuilding(kit: BuildKit, spec: BuildingSpec) {
  const r = rng(hashString(spec.id));
  const floorH = spec.floorH ?? 3.2;
  const groundH = spec.groundH ?? 4.5;
  const parapet = 0.9;
  const sgn = spec.side === 'W' ? -1 : 1; // direction away from the street
  const frontFace = spec.side === 'W' ? 0 : 1; // +x face looks at the street from the west side
  const backFace = 1 - frontFace;
  const trim = spec.trim ?? shade(spec.wall, 0.25);
  const accent = spec.accent ?? shade(spec.wall, -0.3);
  const ppm = spec.ppm ?? 12;

  const firewall = kit.material(`fw:${spec.wall}`, () => new THREE.MeshStandardMaterial({ map: firewallTexture(spec.wall), roughness: 0.95 }));
  const back = kit.material(`bw:${spec.wall}`, () => new THREE.MeshStandardMaterial({ map: backWallTexture(spec.wall), roughness: 0.95 }));
  const roof = kit.material('roof', () => new THREE.MeshStandardMaterial({ map: roofTexture(), roughness: 1 }));

  /** z of a point `u` metres from the facade's left edge (as seen from the street). */
  const zAt = (zS: number, zN: number, u: number) => (spec.side === 'W' ? zS - u : zN + u);

  const tiers: (Tier & { style: FacadeStyle })[] = [
    { floors: spec.floors, inset: spec.setback ?? 0, sideInset: 0, style: spec.style },
    ...(spec.tiers ?? []).map((t) => ({ ...t, style: t.style ?? spec.style })),
  ];

  let base = 0;
  let frontOffset = 0;
  let zS = spec.zSouth;
  let zN = spec.zNorth;
  let depth = spec.depth;
  let topRoofY = 0;
  let topFrontX = 0;
  let topZS = zS, topZN = zN, topDepth = depth;

  tiers.forEach((tier, k) => {
    frontOffset += tier.inset;
    depth -= tier.inset;
    zS -= tier.sideInset ?? 0;
    zN += tier.sideInset ?? 0;
    const ground = k === 0;
    const frontX = sgn * (FRONT_X + frontOffset);
    const H = facadeHeight(ground ? tier.floors : tier.floors + 1, floorH, ground ? groundH : 0, parapet);

    // rounded corner at the street end of the ground tier
    let boxZS = zS, boxZN = zN;
    const R = ground && spec.roundCorner ? 5 : 0;
    if (R) {
      if (spec.roundCorner === 'south') boxZS = zS - R;
      else boxZN = zN + R;
    }
    const len = boxZS - boxZN;
    const facade = paintFacade({
      width: len,
      floors: ground ? tier.floors : tier.floors + 1,
      floorH,
      groundH: ground ? groundH : 0,
      parapet,
      style: tier.style,
      wall: spec.wall,
      trim,
      accent,
      shops: spec.shops ?? true,
      ground,
      entranceW: ground && spec.entrance ? Math.min(12, len * 0.3) : 0,
      ppm,
      r,
    });
    const front = new THREE.MeshStandardMaterial({
      map: facade.map,
      emissiveMap: facade.emissive,
      emissive: 0xffffff,
      emissiveIntensity: 0,
      roughness: 0.8,
    });
    kit.windowMaterials.push(front);

    const mats: THREE.Material[] = [];
    mats[frontFace] = front;
    mats[backFace] = back;
    mats[2] = roof;
    mats[3] = roof;
    mats[4] = firewall;
    mats[5] = firewall;
    const tiles = [3.2, 3.2, 6, 6, 4, 4];
    const geo = boxWithWorldUV(depth, H, len, tiles, [frontFace]);
    const mesh = new THREE.Mesh(geo, mats);
    mesh.position.set(frontX + (sgn * depth) / 2, base + H / 2, (boxZS + boxZN) / 2);
    kit.addMesh(mesh);

    if (R) {
      // the corner block behind the curve, and the curve itself, wrapped in the same facade style
      const cornerZ0 = spec.roundCorner === 'south' ? zS : zN + R;
      const behind = new THREE.Mesh(boxWithWorldUV(depth - R, H, R, tiles, []), [firewall, firewall, roof, roof, firewall, firewall]);
      behind.position.set(frontX + sgn * (R + (depth - R) / 2), base + H / 2, cornerZ0 - R / 2);
      kit.addMesh(behind);
      const curveFacade = paintFacade({
        width: Math.PI * 2 * R, floors: tier.floors, floorH, groundH, parapet, style: tier.style === 'classic' ? 'classic' : 'ribbon',
        wall: spec.wall, trim, accent, shops: spec.shops ?? true, ground: true, entranceW: 0, ppm, r,
      });
      const curveMat = new THREE.MeshStandardMaterial({ map: curveFacade.map, emissiveMap: curveFacade.emissive, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.8 });
      kit.windowMaterials.push(curveMat);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 32, 1, false), [curveMat, roof, roof]);
      const czc = spec.roundCorner === 'south' ? zS - R : zN + R;
      cyl.position.set(frontX + sgn * R, base + H / 2, czc);
      kit.addMesh(cyl);
    }

    // cornices: at roof level of every tier, and over the ground floor
    const corniceLen = zS - zN + 0.3;
    kit.trim.add(frontX - sgn * 0.22, base + H - parapet - 0.18, (zS + zN) / 2, 0.45, 0.32, corniceLen, 0, trim);
    kit.trim.add(frontX - sgn * 0.1, base + H - 0.06, (zS + zN) / 2, 0.25, 0.12, corniceLen, 0, shade(trim, -0.1)); // parapet coping
    if (ground) kit.trim.add(frontX - sgn * 0.15, groundH - 0.05, (zS + zN) / 2, 0.3, 0.22, corniceLen, 0, trim);

    if (ground) {
      // balconies
      const bp = spec.balconies ?? 0;
      if (bp > 0 && tier.style !== 'curtain') {
        for (let f = 2; f < tier.floors; f++) {
          const y = groundH + (f - 1) * floorH;
          facade.bays.forEach((u, i) => {
            if (i === 0 || i === facade.bays.length - 1 || !r.chance(bp)) return;
            const z = zAt(boxZS, boxZN, u);
            const w = facade.bayW * 0.78;
            kit.slabs.add(frontX - sgn * 0.6, y - 0.08, z, 1.2, 0.16, w, 0, shade(spec.wall, 0.05));
            const railColor = r.chance(0.5) ? '#2b2b2b' : shade(trim, -0.05);
            kit.rails.add(frontX - sgn * 1.18, y + 0.5, z, 0.05, 1.0, w, 0, railColor);
            kit.rails.add(frontX - sgn * 0.6, y + 0.5, z - w / 2, 1.2, 1.0, 0.05, 0, railColor);
            kit.rails.add(frontX - sgn * 0.6, y + 0.5, z + w / 2, 1.2, 1.0, 0.05, 0, railColor);
          });
        }
      }
      // shop signs and awnings
      const rot = spec.side === 'W' ? Math.PI / 2 : -Math.PI / 2;
      for (const unit of facade.shopUnits) {
        const name = r.pick(SHOP_NAMES);
        const [bg, fg] = r.pick(SIGN_COLORS);
        const tex = shopSignTexture(name, bg, fg);
        const mat = kit.material(`sign:${name}:${bg}`, () => {
          const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.05, roughness: 0.6 });
          kit.neonMaterials.push(m);
          return m;
        });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(unit.w, 0.8), mat);
        sign.rotation.y = rot;
        sign.position.set(frontX - sgn * 0.07, groundH - 0.82, zAt(boxZS, boxZN, unit.x + unit.w / 2));
        kit.group.add(sign);
        if (r.chance(0.5)) {
          kit.awnings.add(frontX - sgn * 0.75, groundH - 1.6, zAt(boxZS, boxZN, unit.x + unit.w / 2), 1.5, 0.05, unit.w - 0.3, 0, r.pick(AWNING_COLORS), 0, sgn * 0.35);
        }
      }
      // hotel / theatre canopy over the entrance
      if (spec.entrance && !spec.signs?.some((s) => s.kind === 'marquee')) {
        const w = Math.min(12, len * 0.3);
        kit.trim.add(frontX - sgn * 1.6, groundH - 0.75, (boxZS + boxZN) / 2, 3.2, 0.25, w, 0, '#2d2d2d');
        for (const dz of [-w / 2 + 0.3, w / 2 - 0.3]) kit.rails.add(frontX - sgn * 3.0, (groundH - 0.75) / 2, (boxZS + boxZN) / 2 + dz, 0.12, groundH - 0.75, 0.12, 0, '#444');
      }
    }

    topRoofY = base + H - parapet;
    topFrontX = frontX;
    topZS = zS;
    topZN = zN;
    topDepth = depth;
    base += H - parapet;
  });

  // rooftop clutter on the highest roof
  const roofArea = (topZS - topZN) * topDepth;
  const n = Math.min(14, Math.round(roofArea / 70));
  for (let i = 0; i < n; i++) {
    const x = topFrontX + sgn * r.range(3, topDepth - 1.5);
    const z = r.range(topZN + 1.5, topZS - 1.5);
    kit.roofBoxes.add(x, topRoofY + 0.4, z, r.range(0.8, 1.4), 0.8, r.range(0.6, 1.0), r.next() * 0.3, r.pick(['#d9d9d6', '#bfc3c4', '#e8e6e1']));
  }
  // lift machine room and a water tank or antennas
  kit.roofBoxes.add(topFrontX + sgn * (topDepth * 0.65), topRoofY + 1.3, (topZS + topZN) / 2 + r.range(-4, 4), 3.2, 2.6, 3.4, 0, shade(spec.wall, -0.1));
  if (r.chance(0.5)) kit.roofCyl.add(topFrontX + sgn * (topDepth * 0.8), topRoofY + 1.2, r.range(topZN + 3, topZS - 3), 2, 2.4, 2, 0, '#9aa0a3');
  for (let i = 0, m = r.int(0, 3); i < m; i++) {
    const h = r.range(3, 8);
    kit.roofCyl.add(topFrontX + sgn * r.range(4, topDepth - 2), topRoofY + h / 2, r.range(topZN + 2, topZS - 2), 0.08, h, 0.08, 0, '#777');
  }

  // signs
  for (const s of spec.signs ?? []) addSign(kit, spec, s, { groundH, floorH, topRoofY, topFrontX, topZS, topZN, sgn });

  if (spec.name) kit.label(spec.name, spec.subtitle, new THREE.Vector3(topFrontX - sgn * 2, topRoofY + 7, (topZS + topZN) / 2));
}

interface SignFrame {
  groundH: number;
  floorH: number;
  topRoofY: number;
  topFrontX: number;
  topZS: number;
  topZN: number;
  sgn: number;
}

function addSign(kit: BuildKit, spec: BuildingSpec, s: NonNullable<BuildingSpec['signs']>[number], f: SignFrame) {
  const frontX = f.sgn * FRONT_X;
  const zc = (spec.zSouth + spec.zNorth) / 2;
  const rot = spec.side === 'W' ? Math.PI / 2 : -Math.PI / 2;
  const glow = (tex: THREE.Texture, transparent = false, color: THREE.ColorRepresentation = 0xffffff) => {
    const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: color, emissiveIntensity: 0.3, transparent, alphaTest: transparent ? 0.3 : 0, roughness: 0.5, side: transparent ? THREE.DoubleSide : THREE.FrontSide });
    kit.neonMaterials.push(m);
    return m;
  };
  switch (s.kind) {
    case 'roof': {
      const len = f.topZS - f.topZN;
      const w = Math.min(len * 0.85, s.text.length * 2.1);
      const h = Math.min(3.2, (w / s.text.length) * 1.4);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow(neonTexture(s.text, s.color), true));
      sign.rotation.y = rot;
      sign.position.set(f.topFrontX + f.sgn * 1.2, f.topRoofY + 0.8 + h / 2, (f.topZS + f.topZN) / 2);
      kit.group.add(sign);
      // the steel frame holding it
      for (let dz = -w / 2; dz <= w / 2 + 0.01; dz += w / 4) {
        kit.rails.add(f.topFrontX + f.sgn * 1.5, f.topRoofY + (0.8 + h) / 2, sign.position.z + dz, 0.08, 0.8 + h, 0.08, 0, '#3a3a3a');
      }
      kit.rails.add(f.topFrontX + f.sgn * 1.5, f.topRoofY + 0.8, sign.position.z, 0.08, 0.08, w, 0, '#3a3a3a');
      break;
    }
    case 'blade': {
      const bladeW = 2.4;
      const y0 = f.groundH + 0.6;
      const h = f.topRoofY + 5 - y0;
      const z = s.at === 'north' ? spec.zNorth + 1.6 : spec.zSouth - 1.6;
      const tex = boardTexture(s.text, '#f7f3ea', s.color, true, h / bladeW);
      const face = glow(tex);
      const plain = kit.material('blade-plain', () => new THREE.MeshStandardMaterial({ color: '#f2eee6', roughness: 0.7 }));
      const blade = new THREE.Mesh(new THREE.BoxGeometry(bladeW, h, 0.5), [plain, plain, plain, plain, face, face]);
      blade.position.set(frontX - f.sgn * (bladeW / 2 + 0.1), y0 + h / 2, z);
      kit.addMesh(blade, false);
      break;
    }
    case 'marquee': {
      const w = Math.min((spec.zSouth - spec.zNorth) * 0.55, 22);
      const depthOut = 3.4;
      const tex = boardTexture(s.text, s.bg ?? '#141414', s.color, false, w / 1.2);
      const face = glow(tex);
      const plain = kit.material('marquee-plain', () => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.6 }));
      const soffit = kit.material('marquee-soffit', () => {
        const m = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffe2a8', emissiveIntensity: 0.3 });
        kit.neonMaterials.push(m);
        return m;
      });
      const mats: THREE.Material[] = [plain, plain, plain, soffit, face, face];
      mats[spec.side === 'W' ? 0 : 1] = face;
      mats[spec.side === 'W' ? 1 : 0] = plain;
      const box = new THREE.Mesh(new THREE.BoxGeometry(depthOut, 1.2, w), mats);
      box.position.set(frontX - f.sgn * (depthOut / 2), f.groundH - 0.35, zc);
      kit.addMesh(box, false);
      break;
    }
    case 'fascia': {
      const w = Math.min((spec.zSouth - spec.zNorth) * 0.7, s.text.length * 1.15);
      const tex = boardTexture(s.text, s.bg ?? '#222', s.color, false, w / 1.4);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.4), glow(tex));
      plane.rotation.y = rot;
      plane.position.set(frontX - f.sgn * 0.12, f.groundH + 1.0, zc);
      kit.group.add(plane);
      break;
    }
  }
}
