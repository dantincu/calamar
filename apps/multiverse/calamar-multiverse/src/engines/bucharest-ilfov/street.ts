import * as THREE from 'three';
import { InstanceBatch, canvasTexture, fitText, makeCanvas, noise, rng } from '../core/util';
import { AXIS_NORTH, AXIS_SOUTH, CROSS_STREETS, FRONT_X, ROAD_HALF, ROMANA_HALF, ROMANA_Z } from './layout';
import type { BuildKit } from './buildings';

const SIDEWALK_H = 0.15;

/** z-intervals along the axis where there is no sidewalk (cross streets, Piața Romană). */
export function axisGaps(): [number, number][] {
  const gaps: [number, number][] = CROSS_STREETS.filter((c) => c.z !== ROMANA_Z).map((c) => [c.z - c.width / 2, c.z + c.width / 2]);
  gaps.push([ROMANA_Z - ROMANA_HALF - 8, ROMANA_Z + ROMANA_HALF]); // Piața Romană
  return gaps.sort((a, b) => a[0] - b[0]);
}

let segCache: [number, number][] | null = null;

/** Sidewalk segments [zNorth, zSouth] along the axis. */
export function sidewalkSegments(): [number, number][] {
  if (segCache) return segCache;
  const segs: [number, number][] = [];
  let z = AXIS_NORTH;
  for (const [a, b] of axisGaps()) {
    if (a > z + 2) segs.push([z, a]);
    z = Math.max(z, b);
  }
  if (AXIS_SOUTH > z + 2) segs.push([z, AXIS_SOUTH]);
  segCache = segs;
  return segs;
}

export function onAxisSidewalk(x: number, z: number): boolean {
  const ax = Math.abs(x);
  if (ax < ROAD_HALF || ax > FRONT_X + 0.5) return false;
  return sidewalkSegments().some(([a, b]) => z >= a && z <= b);
}

function roadTexture(): THREE.CanvasTexture {
  const ppm = 10.67; // 256 px = 24 m
  const [c, ctx] = makeCanvas(256, 512); // 24 m × 48 m
  const r = rng(42);
  ctx.fillStyle = '#3b3c3e';
  ctx.fillRect(0, 0, 256, 512);
  noise(ctx, 0, 0, 256, 512, r, 0.12, 9000);
  // patches and tyre-polished lane centres
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(${r.chance(0.5) ? '20,20,22' : '80,80,82'},${0.15 + r.next() * 0.15})`;
    ctx.fillRect(r.next() * 256, r.next() * 512, 20 + r.next() * 60, 10 + r.next() * 50);
  }
  for (const lane of [1.5, 4.5, 7.5, 10.5, 13.5, 16.5, 19.5, 22.5]) {
    ctx.fillStyle = 'rgba(15,15,15,0.18)';
    ctx.fillRect((lane - 0.9) * ppm, 0, 0.5 * ppm, 512);
    ctx.fillRect((lane + 0.4) * ppm, 0, 0.5 * ppm, 512);
  }
  ctx.fillStyle = '#e8e6df';
  // double solid centre line
  ctx.fillRect((12 - 0.3) * ppm, 0, 0.15 * ppm, 512);
  ctx.fillRect((12 + 0.15) * ppm, 0, 0.15 * ppm, 512);
  // lane dashes: 4 m line, 8 m gap
  for (const x of [3, 6, 9, 15, 18, 21]) {
    for (let y = 0; y < 48; y += 12) ctx.fillRect((x - 0.06) * ppm, y * ppm, 0.12 * ppm, 4 * ppm);
  }
  // edge lines
  ctx.fillRect(0.3 * ppm, 0, 0.12 * ppm, 512);
  ctx.fillRect((24 - 0.42) * ppm, 0, 0.12 * ppm, 512);
  const t = canvasTexture(c, { repeat: true, anisotropy: 16 });
  return t;
}

function pavingTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(128, 128); // 2 m tile, 40 cm slabs
  const r = rng(7);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const v = 165 + r.next() * 25;
      ctx.fillStyle = `rgb(${v},${v - 3},${v - 8})`;
      ctx.fillRect(x * 25.6, y * 25.6, 25.6, 25.6);
    }
  }
  noise(ctx, 0, 0, 128, 128, r, 0.12, 1200);
  ctx.strokeStyle = 'rgba(60,55,50,0.45)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath(); ctx.moveTo(i * 25.6, 0); ctx.lineTo(i * 25.6, 128); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * 25.6); ctx.lineTo(128, i * 25.6); ctx.stroke();
  }
  // gum spots and stains
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = `rgba(50,50,50,${0.2 + r.next() * 0.3})`;
    ctx.beginPath();
    ctx.arc(r.next() * 128, r.next() * 128, 0.8 + r.next(), 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTexture(c, { repeat: true });
}

export interface Street {
  update(elapsed: number): void;
}

export function buildStreet(kit: BuildKit): Street {
  const g = kit.group;
  const r = rng(2024);
  const length = AXIS_SOUTH - AXIS_NORTH;
  const zMid = (AXIS_SOUTH + AXIS_NORTH) / 2;

  // ---------- the carriageway ----------
  const roadTex = roadTexture();
  roadTex.repeat.set(1, length / 48);
  const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.92, emissive: '#5a4022', emissiveMap: roadTex, emissiveIntensity: 0 });
  kit.lampLit.push(roadMat);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, length), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, zMid);
  road.receiveShadow = true;
  g.add(road);

  // Piața Romană: open asphalt, a green island with the Capitoline Wolf
  const asphalt = new THREE.MeshStandardMaterial({ color: '#3d3e40', roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, emissive: '#2a2016', emissiveIntensity: 0 });
  kit.lampLit.push(asphalt);
  const square = new THREE.Mesh(new THREE.PlaneGeometry(190, ROMANA_HALF * 2 + 14), asphalt);
  square.rotation.x = -Math.PI / 2;
  square.position.set(0, 0.02, ROMANA_Z);
  square.receiveShadow = true;
  g.add(square);
  const grass = new THREE.MeshStandardMaterial({ color: '#4c7a3a', roughness: 1 });
  const curbMat = new THREE.MeshStandardMaterial({ color: '#b9b4aa', roughness: 0.85 });
  const island = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.25, 48), [curbMat, grass, curbMat]);
  island.position.set(0, 0.125, ROMANA_Z);
  island.receiveShadow = true;
  g.add(island);

  // ---------- sidewalks and curbs ----------
  const paving = pavingTexture();
  const sidewalkMat = new THREE.MeshStandardMaterial({ map: paving, roughness: 0.9, emissive: '#4a3a26', emissiveMap: paving, emissiveIntensity: 0 });
  kit.lampLit.push(sidewalkMat);
  const swW = FRONT_X - ROAD_HALF;
  for (const [a, b] of sidewalkSegments()) {
    const len = b - a;
    for (const side of [-1, 1]) {
      const geo = new THREE.BoxGeometry(swW, SIDEWALK_H, len);
      const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
      for (let i = 8; i < 12; i++) uv.setXY(i, uv.getX(i) * (swW / 2), uv.getY(i) * (len / 2)); // top face in 2 m tiles
      const sw = new THREE.Mesh(geo, sidewalkMat);
      sw.position.set(side * (ROAD_HALF + swW / 2), SIDEWALK_H / 2, (a + b) / 2);
      sw.receiveShadow = true;
      g.add(sw);
      kit.trim.add(side * (ROAD_HALF + 0.12), SIDEWALK_H / 2 + 0.01, (a + b) / 2, 0.25, SIDEWALK_H + 0.02, len, 0, '#bdb8ad');
    }
  }

  // ---------- zebra crossings ----------
  const white = new THREE.MeshStandardMaterial({ color: '#efede6', roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 });
  const zebra = new InstanceBatch(new THREE.BoxGeometry(1, 0.02, 1), white);
  for (const cs of CROSS_STREETS) {
    if (cs.z === ROMANA_Z) continue;
    for (const dz of [-(cs.width / 2 + 2.6), cs.width / 2 + 2.6]) {
      for (let x = -ROAD_HALF + 0.6; x < ROAD_HALF - 0.4; x += 1.0) zebra.add(x, 0.02, cs.z + dz, 0.5, 1, 4);
    }
    for (const side of [-1, 1]) {
      for (let z = cs.z - cs.width / 2 + 0.6; z < cs.z + cs.width / 2 - 0.4; z += 1.0) zebra.add(side * (ROAD_HALF + 3.4), 0.02, z, 4.5, 1, 0.5);
    }
  }
  // around the square
  for (const z of [ROMANA_Z - ROMANA_HALF + 6, ROMANA_Z + ROMANA_HALF - 6]) {
    for (let x = -ROAD_HALF + 0.6; x < ROAD_HALF - 0.4; x += 1.0) zebra.add(x, 0.03, z, 0.5, 1, 4);
  }
  g.add(zebra.build({ castShadow: false }));

  // ---------- street lamps, trees, trolleybus wires ----------
  const poleMat = new THREE.MeshStandardMaterial({ color: '#4a4f52', roughness: 0.5, metalness: 0.7 });
  const poles = new InstanceBatch(new THREE.CylinderGeometry(0.09, 0.14, 1, 8), poleMat);
  const arms = new InstanceBatch(new THREE.BoxGeometry(1, 1, 1), poleMat);
  const lampMat = new THREE.MeshStandardMaterial({ color: '#f5f1e6', emissive: '#ffdca0', emissiveIntensity: 0, roughness: 0.3 });
  kit.neonMaterials.push(lampMat);
  const heads = new InstanceBatch(new THREE.BoxGeometry(1, 1, 1), lampMat);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5a4636', roughness: 1 });
  const trunks = new InstanceBatch(new THREE.CylinderGeometry(0.14, 0.2, 1, 7), trunkMat);
  const leafMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true });
  const crowns = new InstanceBatch(new THREE.IcosahedronGeometry(1, 1), leafMat);

  const wirePts: number[] = [];
  const LAMP_X = ROAD_HALF + 0.7;
  const WIRE_Y = 5.9;
  for (const [a, b] of sidewalkSegments()) {
    for (let z = b - 6; z > a + 3; z -= 32) {
      for (const side of [-1, 1]) {
        const x = side * LAMP_X;
        poles.add(x, 4.5, z, 1, 9, 1);
        arms.add(x - side * 1.1, 8.85, z, 2.3, 0.12, 0.12);
        heads.add(x - side * 2.1, 8.75, z, 0.9, 0.18, 0.4);
      }
      // span wire across the road, hangers down to the four contact wires
      wirePts.push(-LAMP_X, 6.5, z, LAMP_X, 6.5, z);
      for (const wx of [-10.8, -10.2, 10.2, 10.8]) wirePts.push(wx, 6.5, z, wx, WIRE_Y, z);
      // trees between lamps
      const tz = z - 16;
      if (tz > a + 4) {
        for (const side of [-1, 1]) {
          if (!r.chance(0.7)) continue;
          const h = r.range(3, 4.5);
          trunks.add(side * (ROAD_HALF + 2.0), h / 2 + SIDEWALK_H, tz, 1, h, 1);
          const s = r.range(2.2, 3.2);
          const green = new THREE.Color().setHSL(0.24 + r.next() * 0.08, 0.45, 0.24 + r.next() * 0.1);
          crowns.add(side * (ROAD_HALF + 2.0), h + s * 0.7 + SIDEWALK_H, tz, s, s * 0.85, s, r.next() * 3, green);
        }
      }
    }
  }
  // the contact wires themselves, the whole length of the axis
  for (const wx of [-10.8, -10.2, 10.2, 10.8]) {
    for (let z = AXIS_NORTH; z < AXIS_SOUTH; z += 32) wirePts.push(wx, WIRE_Y, z, wx, WIRE_Y, Math.min(z + 32, AXIS_SOUTH));
  }
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute('position', new THREE.Float32BufferAttribute(wirePts, 3));
  g.add(new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: '#1e1e1e' })));

  // ---------- traffic lights ----------
  const lensGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lights: { main: boolean; color: 0 | 1 | 2; offset: number }[] = [];
  const lensBatch = new InstanceBatch(lensGeo, lensMat);
  const housings = new InstanceBatch(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.6 }));
  CROSS_STREETS.forEach((cs, ci) => {
    if (cs.z === ROMANA_Z || cs.z > AXIS_SOUTH || cs.z < AXIS_NORTH) return;
    const near = cs.width / 2 + 1.2;
    // [x, z, facing angle, controls main road?]
    const posts: [number, number, number, boolean][] = [
      [ROAD_HALF + 0.5, cs.z + near, 0, true], // northbound traffic sees it facing +z
      [-ROAD_HALF - 0.5, cs.z - near, Math.PI, true],
      [ROAD_HALF + 0.5, cs.z - near, Math.PI / 2, false],
      [-ROAD_HALF - 0.5, cs.z + near, -Math.PI / 2, false],
    ];
    for (const [x, z, ang, main] of posts) {
      poles.add(x, 2, z, 0.8, 4, 0.8);
      housings.add(x, 3.6, z, 0.38, 1.05, 0.3, ang);
      const fx = Math.sin(ang) * 0.17, fz = Math.cos(ang) * 0.17;
      ([0, 1, 2] as const).forEach((color, i) => {
        lensBatch.add(x + fx, 3.95 - i * 0.34, z + fz, 1, 1, 1);
        lights.push({ main, color, offset: ci * 7 });
      });
    }
  });
  const lensMesh = lensBatch.build({ castShadow: false });
  g.add(lensMesh, housings.build());

  // ---------- bus / trolleybus shelters ----------
  const glassMat = new THREE.MeshStandardMaterial({ color: '#9fc4d6', transparent: true, opacity: 0.35, roughness: 0.1 });
  const shelterFrame = new THREE.MeshStandardMaterial({ color: '#30343a', roughness: 0.5, metalness: 0.5 });
  const stbTex = (() => {
    const [c, ctx] = makeCanvas(256, 64);
    ctx.fillStyle = '#c8102e';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    fitText(ctx, 'STB  •  STAȚIE', 128, 34, 230, 36);
    return canvasTexture(c);
  })();
  const stbMat = new THREE.MeshStandardMaterial({ map: stbTex, emissiveMap: stbTex, emissive: 0xffffff, emissiveIntensity: 0.2 });
  kit.neonMaterials.push(stbMat);
  for (const [side, z] of [[1, -300], [-1, -540], [1, -660], [-1, -95], [1, 300], [-1, 460]] as const) {
    const x = side * (ROAD_HALF + 3.2);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 8), shelterFrame);
    roof.position.set(x, 2.7, z);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.2, 8), glassMat);
    back.position.set(x + side * 0.85, 1.35, z);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), stbMat);
    sign.position.set(x, 3.1, z);
    sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(roof, back, sign);
    for (const dz of [-3.9, 3.9]) arms.add(x + side * 0.85, 1.35, z + dz, 0.08, 2.7, 0.08);
    arms.add(x + side * 0.55, 0.6, z, 0.4, 0.06, 4); // bench
  }

  g.add(poles.build(), arms.build(), heads.build({ castShadow: false }), trunks.build(), crowns.build());

  // ---------- light cycle: 22 s green, 3 s yellow, 25 s red for the boulevard; the side streets the other way ----------
  const RED = new THREE.Color('#ff2a1a'), YELLOW = new THREE.Color('#ffb000'), GREEN = new THREE.Color('#22e06b'), OFF = new THREE.Color('#2a2a2a');
  let lastPhaseKey = '';
  return {
    update(elapsed: number) {
      const states: string[] = [];
      lights.forEach((l, i) => {
        const t = (elapsed + l.offset) % 50;
        let on: 0 | 1 | 2; // 0 red, 1 yellow, 2 green
        if (l.main) on = t < 22 ? 2 : t < 25 ? 1 : 0;
        else on = t < 25 ? 0 : t < 47 ? 2 : 1;
        states.push(String(on));
        const c = l.color === on ? (on === 0 ? RED : on === 1 ? YELLOW : GREEN) : OFF;
        lensMesh.setColorAt(i, c);
      });
      const key = states.join('');
      if (key !== lastPhaseKey && lensMesh.instanceColor) {
        lensMesh.instanceColor.needsUpdate = true;
        lastPhaseKey = key;
      }
    },
  };
}
