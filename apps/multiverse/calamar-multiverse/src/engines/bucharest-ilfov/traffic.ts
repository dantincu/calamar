import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng } from '../core/util';
import { AXIS_NORTH, AXIS_SOUTH, CROSS_STREETS, LANES, ROAD_HALF, ROMANA_Z } from './layout';
import { sidewalkSegments } from './street';

function colored(geo: THREE.BufferGeometry, v: number, x = 0, y = 0, z = 0): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.translate(x, y, z);
  const n = g.getAttribute('position').count;
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(n * 3).fill(v), 3));
  g.deleteAttribute('uv');
  return g;
}

/** A car facing -z, wheels on y = 0. */
function carGeometry(): THREE.BufferGeometry {
  const parts = [
    colored(new THREE.BoxGeometry(1.8, 0.72, 4.3), 1, 0, 0.66, 0),
    colored(new THREE.BoxGeometry(1.6, 0.6, 2.2), 0.13, 0, 1.32, 0.25),
    colored(new THREE.BoxGeometry(1.62, 0.1, 2.1), 1, 0, 1.66, 0.25), // roof
  ];
  for (const [x, z] of [[-0.85, -1.35], [0.85, -1.35], [-0.85, 1.35], [0.85, 1.35]]) {
    parts.push(colored(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 12).rotateZ(Math.PI / 2), 0.04, x, 0.33, z));
  }
  return mergeGeometries(parts)!;
}

/** A 12 m bus / trolleybus facing -z; with trolley poles reaching the overhead wires when `poles`. */
function busGeometry(poles: boolean): THREE.BufferGeometry {
  const parts = [
    colored(new THREE.BoxGeometry(2.55, 2.0, 12), 1, 0, 1.45, 0),
    colored(new THREE.BoxGeometry(2.57, 1.0, 11.4), 0.12, 0, 1.75, 0.2), // window band
    colored(new THREE.BoxGeometry(2.4, 0.3, 4), 0.85, 0, 2.6, 1), // roof equipment
  ];
  for (const [x, z] of [[-1.1, -3.8], [1.1, -3.8], [-1.1, 3.6], [1.1, 3.6]]) {
    parts.push(colored(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12).rotateZ(Math.PI / 2), 0.04, x, 0.5, z));
  }
  if (poles) {
    // two poles from the rear roof up and back to the wires at 5.9 m (0.3 m either side of the lane centre)
    for (const x of [-0.3, 0.3]) {
      const pole = new THREE.CylinderGeometry(0.04, 0.04, 6.2, 5);
      pole.rotateX(-Math.atan2(5.9 - 2.75, 5.3) + Math.PI / 2);
      parts.push(colored(pole, 0.1, x, 2.75 + (5.9 - 2.75) / 2, 2.5 + 2.6));
    }
  }
  return mergeGeometries(parts)!;
}

interface Vehicle {
  lane: number; // x of lane centre (sign = direction)
  z: number;
  v: number;
  vMax: number;
  len: number;
  kind: 0 | 1 | 2; // car, bus, trolleybus
  index: number; // instance index in its mesh
}

const CAR_COLORS = ['#f2f2f2', '#1b1b1b', '#9aa0a6', '#5d6166', '#a31621', '#1f4e79', '#c9c3b6', '#2e5e4e', '#d4a017', '#e8e8e8', '#3a3a3a', '#7d1d1d'];

export interface Traffic {
  group: THREE.Group;
  update(dt: number, elapsed: number): void;
  setVisible(v: boolean): void;
}

export function buildTraffic(): Traffic {
  const r = rng(77);
  const group = new THREE.Group();
  const vehMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 });
  const L = AXIS_SOUTH - AXIS_NORTH - 40;
  const z0 = AXIS_NORTH + 20;

  const vehicles: Vehicle[] = [];
  const counts = [0, 0, 0];
  for (const dir of [-1, 1]) {
    for (const laneX of LANES) {
      const lane = dir * laneX; // dir -1 → x<0 southbound (+z); dir +1 → x>0 northbound (-z)
      const outer = laneX === LANES[LANES.length - 1];
      let z = z0 + r.range(0, 30);
      while (z < z0 + L - 10) {
        const kind: 0 | 1 | 2 = outer && r.chance(0.25) ? (r.chance(0.7) ? 2 : 1) : 0;
        const len = kind === 0 ? 4.3 : 12;
        vehicles.push({ lane, z, v: 0, vMax: (outer ? 10 : 12 + laneX * 0.4) + r.range(-1.5, 1.5), len, kind, index: counts[kind]++ });
        z += len + r.range(14, 45);
      }
    }
  }
  const meshes = [
    new THREE.InstancedMesh(carGeometry(), vehMat, counts[0]),
    new THREE.InstancedMesh(busGeometry(false), vehMat, Math.max(1, counts[1])),
    new THREE.InstancedMesh(busGeometry(true), vehMat, Math.max(1, counts[2])),
  ];
  meshes[1].count = counts[1];
  meshes[2].count = counts[2];
  for (const v of vehicles) {
    const color = v.kind === 0 ? r.pick(CAR_COLORS) : v.kind === 1 ? '#e7b416' : '#d8dde2';
    meshes[v.kind].setColorAt(v.index, new THREE.Color(color));
  }
  meshes.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(m);
  });

  // lanes as rings, for finding each vehicle's leader
  const lanes = new Map<number, Vehicle[]>();
  for (const v of vehicles) {
    if (!lanes.has(v.lane)) lanes.set(v.lane, []);
    lanes.get(v.lane)!.push(v);
  }

  const crossings = CROSS_STREETS.map((c, i) => ({ ...c, offset: i * 7 })).filter((c) => c.z !== ROMANA_Z && c.z < AXIS_SOUTH && c.z > AXIS_NORTH);

  // ---------- pedestrians ----------
  const segs = sidewalkSegments();
  const peds: { x: number; z: number; v: number; seg: [number, number]; phase: number }[] = [];
  for (const seg of segs) {
    for (const side of [-1, 1]) {
      const n = Math.floor((seg[1] - seg[0]) / 9);
      for (let i = 0; i < n; i++) {
        peds.push({ x: side * r.range(ROAD_HALF + 1.2, ROAD_HALF + 7), z: r.range(seg[0] + 1, seg[1] - 1), v: r.range(0.9, 1.6) * (r.chance(0.5) ? 1 : -1), seg, phase: r.next() * 10 });
      }
    }
  }
  const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.85, 3, 8).translate(0, 0.15 + 0.2 + 0.425 + 0.1, 0);
  const headGeo = new THREE.SphereGeometry(0.12, 10, 8).translate(0, 0.15 + 1.47, 0);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const bodies = new THREE.InstancedMesh(bodyGeo, pedMat, peds.length);
  const heads = new THREE.InstancedMesh(headGeo, pedMat, peds.length);
  const CLOTHES = ['#1d3557', '#2b2d42', '#6d6875', '#e63946', '#f1faee', '#a8dadc', '#3d405b', '#81b29a', '#f2cc8f', '#222', '#5e503f', '#8d99ae'];
  const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#ffdbac', '#8d5524'];
  peds.forEach((_, i) => {
    bodies.setColorAt(i, new THREE.Color(r.pick(CLOTHES)));
    heads.setColorAt(i, new THREE.Color(r.pick(SKIN)));
  });
  for (const m of [bodies, heads]) {
    m.castShadow = true;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(m);
  }

  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);

  return {
    group,
    setVisible(v: boolean) {
      group.visible = v;
    },
    update(dt: number, elapsed: number) {
      if (!group.visible) return;
      // vehicles: follow the leader, stop for red lights
      for (const laneVehicles of lanes.values()) {
        const dirZ = laneVehicles[0].lane > 0 ? -1 : 1; // northbound drive towards -z
        // position along the direction of travel, 0…L
        const s = (v: Vehicle) => (dirZ > 0 ? v.z - z0 : z0 + L - v.z);
        laneVehicles.sort((a, b) => s(a) - s(b));
        for (let i = 0; i < laneVehicles.length; i++) {
          const v = laneVehicles[i];
          const lead = laneVehicles[(i + 1) % laneVehicles.length];
          let gap = s(lead) - s(v) - lead.len / 2 - v.len / 2;
          if (gap < -L / 2) gap += L;
          if (laneVehicles.length === 1) gap = 1e9;
          let target = v.vMax;
          target = Math.min(target, Math.max(0, (gap - 2.5) / 1.4));
          for (const c of crossings) {
            const stopZ = dirZ < 0 ? c.z + c.width / 2 + 5 : c.z - c.width / 2 - 5;
            const dist = (stopZ - v.z) * dirZ - v.len / 2;
            if (dist < -0.5 || dist > 45) continue;
            const t = (elapsed + c.offset) % 50;
            if (t >= 22) target = Math.min(target, Math.max(0, Math.sqrt(Math.max(0, 2 * 3 * (dist - 0.5)))));
          }
          const acc = target > v.v ? 2.2 : 6;
          v.v += Math.sign(target - v.v) * Math.min(Math.abs(target - v.v), acc * dt);
          v.z += dirZ * v.v * dt;
          if (v.z < z0) v.z += L;
          if (v.z > z0 + L) v.z -= L;
          pos.set(v.lane, 0, v.z);
          q.setFromAxisAngle(up, dirZ > 0 ? Math.PI : 0);
          mtx.compose(pos, q, one);
          meshes[v.kind].setMatrixAt(v.index, mtx);
        }
      }
      meshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));

      // pedestrians
      peds.forEach((p, i) => {
        p.z += p.v * dt;
        if (p.z < p.seg[0] + 0.5 || p.z > p.seg[1] - 0.5) {
          p.v = -p.v;
          p.z = THREE.MathUtils.clamp(p.z, p.seg[0] + 0.5, p.seg[1] - 0.5);
        }
        const bob = Math.abs(Math.sin((elapsed + p.phase) * Math.abs(p.v) * 4)) * 0.04;
        pos.set(p.x, bob, p.z);
        q.setFromAxisAngle(up, p.v > 0 ? Math.PI : 0);
        mtx.compose(pos, q, one);
        bodies.setMatrixAt(i, mtx);
        heads.setMatrixAt(i, mtx);
      });
      bodies.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
    },
  };
}
