import * as THREE from 'three';
import type { EngineContext, EngineWorld, Viewpoint } from '../core/types';
import type { Settings } from '../../settings/settings';
import { disposeObject } from '../core/util';
import { AXIS_NORTH, AXIS_SOUTH, CROSS_STREETS, FRONT_X, MAGHERU_NORTH, MAGHERU_SOUTH, ROMANA_HALF, ROMANA_Z, UNIVERSITATE_Z, axisBuildings, magheruBuildings } from './layout';
import { BuildKit, addBuilding } from './buildings';
import { buildStreet, onAxisSidewalk } from './street';
import { buildTraffic } from './traffic';
import { ILFOV_RADIUS, PARKS, buildCity } from './city';
import { buildLandmarks } from './landmarks';
import { Environment } from './environment';
import { clearFacadeCache } from './facade';
import { clearSignCache } from './signs';
import { EarthFrame } from '../core/earth/geo';
import { Earth } from '../core/earth/Earth';

/** The local origin (south end of Magheru, on the boulevard's axis) on the globe. */
const ORIGIN_LAT = 44.44;
const ORIGIN_LON = 26.0975;

const vp = (name: string, x: number, y: number, z: number, yawDeg: number, pitchDeg: number): Viewpoint => ({
  name,
  position: new THREE.Vector3(x, y, z),
  yaw: (yawDeg * Math.PI) / 180,
  pitch: (pitchDeg * Math.PI) / 180,
});

export async function createWorld(ctx: EngineContext): Promise<EngineWorld> {
  const { scene, settings, renderer } = ctx;
  const kit = new BuildKit();
  const frame = new EarthFrame(ORIGIN_LAT, ORIGIN_LON);
  const shapes = Earth.fetchShapes(); // downloads while the city is generated
  shapes.catch(() => {}); // awaited below; don't report it as unhandled meanwhile

  // let the "Building…" message paint before the heavy, synchronous generation
  await new Promise((r) => setTimeout(r, 30));

  for (const spec of magheruBuildings()) addBuilding(kit, spec);
  for (const spec of axisBuildings()) addBuilding(kit, spec);
  buildLandmarks(kit);
  const street = buildStreet(kit);
  const city = buildCity(kit);

  // street name signs at the corners
  for (const cs of CROSS_STREETS) {
    kit.label(cs.west, undefined, new THREE.Vector3(-FRONT_X - 4, 5, cs.z), 'street', 220);
    if (cs.east !== cs.west) kit.label(cs.east, undefined, new THREE.Vector3(FRONT_X + 4, 5, cs.z), 'street', 220);
  }
  kit.label('Bd. General Gheorghe Magheru', undefined, new THREE.Vector3(0, 9, -380), 'street', 2500);
  kit.label('Bd. Nicolae Bălcescu', undefined, new THREE.Vector3(0, 9, 380), 'street', 2500);
  kit.label('Bd. Lascăr Catargiu', undefined, new THREE.Vector3(0, 9, -1180), 'street', 2500);
  kit.label('Piața Romană', undefined, new THREE.Vector3(-30, 9, ROMANA_Z), 'street', 2500);
  kit.label('Piața Universității', undefined, new THREE.Vector3(-30, 9, UNIVERSITATE_Z), 'street', 2500);

  kit.finish();
  scene.add(kit.group);

  const traffic = buildTraffic();
  scene.add(traffic.group);

  // the rest of the planet, coarse: drawn first, under the detailed scene
  const earth = Earth.create(frame, await shapes, renderer, settings.quality);
  scene.add(earth.group, earth.labels);

  const env = new Environment(scene);
  const windowMats = [...kit.windowMaterials, ...city.windowMaterials];

  const colliders = [...kit.colliders, ...city.colliders];

  const groundHeight = (x: number, z: number) => {
    if (onAxisSidewalk(x, z)) return 0.15;
    return city.groundHeight(x, z);
  };

  let trafficOn = settings.traffic;
  let litFor = -1; // the env.night value the windows, neon and lamps were last lit for
  const lightUp = () => {
    const n = env.night;
    if (Math.abs(n - litFor) < 0.005) return;
    litFor = n;
    windowMats.forEach((m) => (m.emissiveIntensity = n * 1.1));
    kit.neonMaterials.forEach((m) => (m.emissiveIntensity = 0.12 + n * 1.6));
    kit.lampLit.forEach((m) => (m.emissiveIntensity = n * 1.4));
  };
  const applySettings = (s: Settings) => {
    env.setTime(s.timeOfDay);
    env.setQuality(s.quality);
    lightUp();
    trafficOn = s.traffic;
  };
  applySettings(settings);

  const spawn = vp('Magheru, by Cinema Patria', 2.2, 2.2, -70, -12, 3);
  const viewpoints: Viewpoint[] = [
    spawn,
    vp('Sidewalk at Hotel Lido', -13.5, 1.6, -45, -25, 8),
    vp('Above Patria, looking north', 6, 45, 40, 0, -14),
    vp('Piața Romană and ASE', -25, 14, -760, -35, -6),
    vp('Snail’s-eye view', 15, 0.17, -250, -20, 2),
    vp('Over the boulevard, 600 m', 0, 600, 600, 0, -38),
    vp('High above Bucharest', 1200, 4500, 3500, 20, -45),
    geoVp('Low orbit over the Black Sea', 42.5, 31.5, 400000, -60, -24),
    geoVp('The Alps from 120 km', 44.2, 8.5, 120000, 15, -30),
    geoVp('The whole Earth', 30, 26.1, 25000000, 0, -89.9),
  ];

  function geoVp(name: string, lat: number, lon: number, height: number, yawDeg: number, pitchDeg: number): Viewpoint {
    const p = frame.toLocal(lat, lon, height);
    return vp(name, p.x, p.y, p.z, yawDeg, pitchDeg);
  }

  const tmp = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const aligned = new THREE.Quaternion();

  return {
    spawn,
    viewpoints,
    colliders,
    groundHeight,
    planet: frame,
    locate(p) {
      // away from the detailed scene, say which country or sea is below
      if (Math.hypot(p.x, p.z) > ILFOV_RADIUS || p.y > 30000) {
        const where = earth.locate(p);
        return frame.altitude(p) > 100000 ? `Above ${where}` : where;
      }
      const parts: string[] = [];
      if (p.z <= MAGHERU_SOUTH && p.z >= MAGHERU_NORTH) parts.push('Bd. Magheru');
      else if (p.z > MAGHERU_SOUTH && p.z < UNIVERSITATE_Z - 15) parts.push('Bd. Nicolae Bălcescu');
      else if (Math.abs(p.z - UNIVERSITATE_Z) <= 15) parts.push('Piața Universității');
      else if (p.z < MAGHERU_NORTH && p.z > ROMANA_Z - ROMANA_HALF) parts.push('Piața Romană');
      else if (p.z <= ROMANA_Z - ROMANA_HALF && p.z > AXIS_NORTH) parts.push('Bd. Lascăr Catargiu');
      else parts.push(p.z > AXIS_SOUTH ? 'south of the centre' : 'north of the centre');
      const park = PARKS.find((pk) => p.x >= pk.rect[0] && p.x <= pk.rect[1] && p.z >= pk.rect[2] && p.z <= pk.rect[3]);
      if (park) return park.name;
      const near = CROSS_STREETS.find((c) => Math.abs(p.z - c.z) < c.width / 2 + 10);
      if (near) parts.push(p.x < 0 ? `colț cu ${near.west}` : `colț cu ${near.east}`);
      if (Math.abs(p.x) > 60) parts.push(`${Math.round(Math.abs(p.x))} m ${p.x < 0 ? 'west' : 'east'} of the axis`);
      if (p.y > 3000) return 'Over Bucharest and Ilfov';
      return parts.join(' · ');
    },
    update(dt, elapsed, camera) {
      const eye = camera.position;
      const gh = groundHeight(eye.x, eye.z);
      const altitude = Number.isFinite(gh) ? eye.y - gh : frame.altitude(eye);
      // the sun follows the drone, so Bucharest's own day or night changes as it flies away
      env.update(camera, altitude, frame.alignedFrame(eye, aligned), frame.toGeo(eye).lat);
      lightUp();
      earth.update(camera, env.sunDir, altitude, origin, ILFOV_RADIUS);

      // the detailed scene only when it is in sight: behind the horizon the globe would not hide it
      const inSight = !frame.occluded(origin, eye, 3000) && eye.distanceTo(origin) < 4000000;
      kit.group.visible = inSight;
      traffic.group.visible = inSight && trafficOn;
      if (inSight) {
        street.update(elapsed);
        traffic.update(dt, elapsed);
      }
      // only label what's reasonably close
      for (const l of kit.labels) {
        l.getWorldPosition(tmp);
        l.visible = inSight && tmp.distanceTo(eye) < (l.userData.maxDist as number);
      }
    },
    applySettings,
    dispose() {
      scene.remove(kit.group, traffic.group);
      kit.labels.forEach((l) => l.element.remove());
      disposeObject(kit.group);
      disposeObject(traffic.group);
      earth.dispose();
      env.dispose(scene);
      clearFacadeCache();
      clearSignCache();
    },
  };
}
