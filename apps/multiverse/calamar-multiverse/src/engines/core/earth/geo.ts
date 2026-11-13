import * as THREE from 'three';
import type { Planet } from '../types';

/** Mean Earth radius, metres. */
export const EARTH_RADIUS = 6371000;
const DEG = Math.PI / 180;

/**
 * Unit vector in the planet's own frame: +Y is the north pole, longitude 0 is +X and 90°E is -Z.
 * This matches the UVs of THREE.SphereGeometry, so an equirectangular map (u = 0 at 180°W) lines up.
 */
export function planetDir(latDeg: number, lonDeg: number, out = new THREE.Vector3()): THREE.Vector3 {
  const la = latDeg * DEG;
  const lo = lonDeg * DEG;
  return out.set(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo));
}

/** Great-circle distance between two points, metres. */
export function greatCircle(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a = Math.sin(((lat2 - lat1) * DEG) / 2) ** 2 + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(((lon2 - lon1) * DEG) / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function formatLatLon(lat: number, lon: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
}

/**
 * Ties an engine's flat local frame (metres, +X east, +Y up, -Z north) to the globe: the local origin
 * sits on the surface at (lat0, lon0) and the planet's centre is straight below it.
 */
export class EarthFrame implements Planet {
  readonly radius = EARTH_RADIUS;
  readonly center = new THREE.Vector3(0, -EARTH_RADIUS, 0);
  /** Rotates the planet's own frame into the local frame. */
  readonly quaternion = new THREE.Quaternion();
  /** The north pole's direction, in local coordinates. */
  readonly northAxis = new THREE.Vector3();
  private inverse = new THREE.Quaternion();
  private v = new THREE.Vector3();
  private e = new THREE.Vector3();
  private n = new THREE.Vector3();
  private m = new THREE.Matrix4();

  constructor(readonly lat0: number, readonly lon0: number) {
    const up = planetDir(lat0, lon0);
    const lo = lon0 * DEG;
    const la = lat0 * DEG;
    const east = new THREE.Vector3(-Math.sin(lo), 0, -Math.cos(lo));
    const north = new THREE.Vector3(-Math.sin(la) * Math.cos(lo), Math.cos(la), Math.sin(la) * Math.sin(lo));
    // columns = the local axes expressed in the planet frame, i.e. local → planet
    this.m.makeBasis(east, up, north.negate());
    this.inverse.setFromRotationMatrix(this.m);
    this.quaternion.copy(this.inverse).invert();
    this.northAxis.set(0, 1, 0).applyQuaternion(this.quaternion);
  }

  /** Local position of a geographic point at a height above the surface. */
  toLocal(lat: number, lon: number, height = 0, out = new THREE.Vector3()): THREE.Vector3 {
    return planetDir(lat, lon, out).multiplyScalar(this.radius + height).applyQuaternion(this.quaternion).add(this.center);
  }

  /** Latitude, longitude (degrees) and height (metres) of a local position. */
  toGeo(p: THREE.Vector3): { lat: number; lon: number; height: number } {
    const v = this.v.copy(p).sub(this.center).applyQuaternion(this.inverse);
    const r = v.length();
    return { lat: Math.asin(THREE.MathUtils.clamp(v.y / r, -1, 1)) / DEG, lon: Math.atan2(-v.z, v.x) / DEG, height: r - this.radius };
  }

  altitude(p: THREE.Vector3): number {
    return this.v.copy(p).sub(this.center).length() - this.radius;
  }

  up(p: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(p).sub(this.center).normalize();
  }

  alignedFrame(p: THREE.Vector3, out = new THREE.Quaternion()): THREE.Quaternion {
    const up = this.up(p, this.v);
    const east = this.e.crossVectors(this.northAxis, up);
    if (east.lengthSq() < 1e-12) east.set(1, 0, 0); // right over a pole: any east will do
    east.normalize();
    const north = this.n.crossVectors(up, east);
    this.m.makeBasis(east, up, north.negate());
    return out.setFromRotationMatrix(this.m);
  }

  /** Whether a point on (or near) the surface is hidden behind the planet's horizon from the eye. */
  occluded(p: THREE.Vector3, eye: THREE.Vector3, margin = 0): boolean {
    // visible when the eye is above the tangent plane through p
    const ux = p.x - this.center.x, uy = p.y - this.center.y, uz = p.z - this.center.z;
    const len = Math.hypot(ux, uy, uz);
    const above = ((eye.x - p.x) * ux + (eye.y - p.y) * uy + (eye.z - p.z) * uz) / len;
    return above < -margin;
  }
}
