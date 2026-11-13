import * as THREE from 'three';
import type { Planet, SpawnPoint } from './types';

export const SPEED_OF_SOUND = 343; // m/s at sea level, 20 °C
export const MIN_SPEED = 0.001; // 1 mm/s — a slow snail
export const SPEED_OF_LIGHT = 299792458; // m/s
export const MAX_SPEED = SPEED_OF_LIGHT; // nothing goes faster, not even with the boost

/** Speed presets on the number keys 1–9 and 0; the wheel reaches everything in between. */
export const SPEED_PRESETS: { key: string; label: string; speed: number }[] = [
  { key: '1', label: 'Snail', speed: 0.002 },
  { key: '2', label: 'Ant', speed: 0.05 },
  { key: '3', label: 'Walk', speed: 1.4 },
  { key: '4', label: 'City car', speed: 13.9 },
  { key: '5', label: 'Highway', speed: 36 },
  { key: '6', label: 'Airliner', speed: 250 },
  { key: '7', label: 'Mach 1', speed: SPEED_OF_SOUND },
  { key: '8', label: 'Mach 5', speed: SPEED_OF_SOUND * 5 },
  { key: '9', label: 'Mach 100', speed: SPEED_OF_SOUND * 100 },
  { key: '0', label: 'Mach 1000', speed: SPEED_OF_SOUND * 1000 },
];

export interface DroneInputState {
  pointerLocked: boolean;
}

/**
 * First-person flying drone.
 * - mouse (pointer lock) looks around; W/A/S/D or the arrows fly along the look direction;
 * - Space / E rise, C / Q sink (straight up and down, whatever the pitch);
 * - Shift boosts ×5, Alt creeps ×0.2; the wheel or +/- change the cruise speed on a log scale;
 * - with no input the drone brakes and hovers in place.
 *
 * Yaw and pitch are relative to `frame`, whose +Y is "up". On a planet the frame is carried along
 * (parallel transport) so that up keeps pointing away from the centre: flying level follows a great
 * circle, with no trouble over the poles.
 */
export class DroneController {
  readonly position = new THREE.Vector3();
  readonly velocity = new THREE.Vector3();
  readonly frame = new THREE.Quaternion();
  yaw = 0;
  pitch = 0;
  cruiseSpeed = 5;
  /** Drone body radius used for collisions, metres. */
  radius = 0.04;

  sensitivity = 1;
  invertY = false;
  onPointerLockChange?: (locked: boolean) => void;
  /** Extra key handling for the host (viewpoints, full screen...). Return true if handled. */
  onKey?: (code: string, e: KeyboardEvent) => boolean;

  private keys = new Set<string>();
  private dom: HTMLElement;
  private disposers: (() => void)[] = [];

  constructor(dom: HTMLElement, spawn: SpawnPoint, private planet: Planet | null = null) {
    this.dom = dom;
    this.teleport(spawn);

    type Events = WindowEventMap & DocumentEventMap;
    const on = <K extends keyof Events>(target: Window | Document | HTMLElement, type: K, fn: (e: Events[K]) => void, opts?: AddEventListenerOptions) => {
      target.addEventListener(type, fn as EventListener, opts);
      this.disposers.push(() => target.removeEventListener(type, fn as EventListener, opts));
    };

    on(dom, 'click', () => {
      if (document.pointerLockElement !== dom) {
        const p = dom.requestPointerLock() as unknown as Promise<void> | undefined;
        p?.catch?.(() => {});
      }
    });
    on(document, 'pointerlockchange', () => {
      const locked = document.pointerLockElement === dom;
      if (!locked) this.keys.clear();
      this.onPointerLockChange?.(locked);
    });
    on(document, 'mousemove', (e) => {
      if (document.pointerLockElement !== dom) return;
      const k = 0.0022 * this.sensitivity;
      this.yaw -= e.movementX * k;
      this.pitch += (this.invertY ? e.movementY : -e.movementY) * k;
      this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.001, Math.PI / 2 - 0.001);
    });
    on(
      dom,
      'wheel',
      (e) => {
        e.preventDefault();
        this.adjustSpeed(e.deltaY < 0 ? 1 : -1);
      },
      { passive: false },
    );
    on(window, 'keydown', (e) => {
      if (isTyping(e)) return;
      // Ctrl/⌘ combinations belong to the browser (Ctrl+R must reload, not also fly back to the start)
      if (e.ctrlKey || e.metaKey) return;
      if (this.onKey?.(e.code, e)) {
        e.preventDefault();
        return;
      }
      const preset = SPEED_PRESETS.find((p) => e.code === `Digit${p.key}`);
      if (preset) {
        this.cruiseSpeed = preset.speed;
        return;
      }
      if (e.code === 'Equal' || e.code === 'NumpadAdd') this.adjustSpeed(1);
      else if (e.code === 'Minus' || e.code === 'NumpadSubtract') this.adjustSpeed(-1);
      else if (e.code === 'KeyX') this.velocity.set(0, 0, 0);
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    on(window, 'keyup', (e) => this.keys.delete(e.code));
    on(window, 'blur', () => this.keys.clear());
  }

  teleport(p: SpawnPoint) {
    this.position.copy(p.position);
    this.yaw = p.yaw;
    this.pitch = p.pitch;
    this.velocity.set(0, 0, 0);
    if (this.planet) this.planet.alignedFrame(this.position, this.frame);
    else this.frame.identity();
  }

  /** Where the drone looks: the frame turned by yaw, then pitch. */
  orientation(out = new THREE.Quaternion()): THREE.Quaternion {
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ');
    return out.setFromEuler(this.euler).premultiply(this.frame);
  }

  /** Yaw and pitch relative to the local north and up at the position (what a saved pose stores). */
  localYawPitch(): { yaw: number; pitch: number } {
    if (!this.planet) return { yaw: this.yaw, pitch: this.pitch };
    const f = this.tmpF.set(0, 0, -1).applyQuaternion(this.orientation(this.tmpQ));
    f.applyQuaternion(this.planet.alignedFrame(this.position, this.tmpQ).invert());
    return { yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(THREE.MathUtils.clamp(f.y, -1, 1)) };
  }

  /** One wheel notch = ×1.25; 31 notches from walking to Mach 1, 31 more to Mach 1000, 30 more to light speed. */
  adjustSpeed(direction: number) {
    this.cruiseSpeed = THREE.MathUtils.clamp(this.cruiseSpeed * Math.pow(1.25, direction), MIN_SPEED, MAX_SPEED);
  }

  get speed(): number {
    return this.velocity.length();
  }

  /** Compass heading in degrees, 0 = north, 90 = east. */
  get heading(): number {
    const yaw = this.planet ? this.localYawPitch().yaw : this.yaw;
    return (((-yaw * 180) / Math.PI) % 360 + 360) % 360;
  }

  private tmpF = new THREE.Vector3();
  private tmpR = new THREE.Vector3();
  private tmpU = new THREE.Vector3();
  private tmpQ = new THREE.Quaternion();
  private euler = new THREE.Euler();
  private target = new THREE.Vector3();
  private step = new THREE.Vector3();

  update(dt: number, colliders: THREE.Box3[], groundHeight: (x: number, z: number) => number) {
    const k = this.keys;
    const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const strafe = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    const lift = (k.has('Space') || k.has('KeyE') ? 1 : 0) - (k.has('KeyC') || k.has('KeyQ') ? 1 : 0);
    let mult = 1;
    if (k.has('ShiftLeft') || k.has('ShiftRight')) mult *= 5;
    if (k.has('AltLeft') || k.has('AltRight')) mult *= 0.2;

    const cp = Math.cos(this.pitch);
    this.tmpF.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp).applyQuaternion(this.frame);
    this.tmpR.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).applyQuaternion(this.frame);
    this.tmpU.set(0, 1, 0).applyQuaternion(this.frame);
    this.target.set(0, 0, 0).addScaledVector(this.tmpF, fwd).addScaledVector(this.tmpR, strafe).addScaledVector(this.tmpU, lift);
    if (this.target.lengthSq() > 0) this.target.normalize().multiplyScalar(Math.min(this.cruiseSpeed * mult, MAX_SPEED));

    // Exponential approach: the same responsiveness at a snail's pace and at Mach 5.
    const a = 1 - Math.exp(-dt / 0.22);
    this.velocity.lerp(this.target, a);
    if (this.target.lengthSq() === 0 && this.velocity.length() < MIN_SPEED * 0.05) this.velocity.set(0, 0, 0);

    // Move in sub-steps so fast flight doesn't tunnel through walls. Each step is a cheap grid lookup;
    // at Mach 1000 (~5.7 km a frame) the 256 steps are ~22 m apart, still thinner than most blocks.
    this.step.copy(this.velocity).multiplyScalar(dt);
    const dist = this.step.length();
    const n = Math.min(256, Math.max(1, Math.ceil(dist / 1.5)));
    this.step.divideScalar(n);
    for (let i = 0; i < n; i++) {
      this.position.add(this.step);
      this.collide(colliders, groundHeight);
    }
    this.transportFrame();
  }

  /** Turn the frame (and the momentum) so that its up follows the planet's surface under the drone. */
  private transportFrame() {
    if (!this.planet) return;
    const oldUp = this.tmpU.set(0, 1, 0).applyQuaternion(this.frame);
    const newUp = this.tmpR.copy(this.position).sub(this.planet.center).normalize();
    if (oldUp.dot(newUp) > 1 - 1e-15) return;
    this.tmpQ.setFromUnitVectors(oldUp, newUp);
    this.frame.premultiply(this.tmpQ).normalize();
    this.velocity.applyQuaternion(this.tmpQ);
  }

  /** Colliders bucketed on a 64 m grid, rebuilt when the world hands over a different array. */
  private gridSource: THREE.Box3[] | null = null;
  private grid = new Map<number, THREE.Box3[]>();
  private static CELL = 64;
  private static key(cx: number, cz: number) {
    return (cx + 32768) * 65536 + (cz + 32768);
  }

  private buildGrid(colliders: THREE.Box3[]) {
    this.grid.clear();
    const C = DroneController.CELL;
    for (const b of colliders) {
      for (let cx = Math.floor(b.min.x / C); cx <= Math.floor(b.max.x / C); cx++) {
        for (let cz = Math.floor(b.min.z / C); cz <= Math.floor(b.max.z / C); cz++) {
          const k = DroneController.key(cx, cz);
          let list = this.grid.get(k);
          if (!list) this.grid.set(k, (list = []));
          list.push(b);
        }
      }
    }
    this.gridSource = colliders;
  }

  private collide(colliders: THREE.Box3[], groundHeight: (x: number, z: number) => number) {
    const p = this.position;
    const r = this.radius;
    const g = groundHeight(p.x, p.z) + r; // -Infinity where the engine has no detailed ground
    if (p.y < g) {
      p.y = g;
      if (this.velocity.y < 0) this.velocity.y = 0;
    }
    if (this.planet) {
      // the planet's surface is the floor everywhere else
      const c = this.planet.center;
      const off = this.tmpF.copy(p).sub(c);
      const d = off.length();
      const floor = this.planet.radius + r;
      if (d < floor) {
        off.divideScalar(d);
        p.copy(c).addScaledVector(off, floor);
        const inward = this.velocity.dot(off);
        if (inward < 0) this.velocity.addScaledVector(off, -inward);
      }
    }
    if (this.gridSource !== colliders) this.buildGrid(colliders);
    const C = DroneController.CELL;
    const near = this.grid.get(DroneController.key(Math.floor(p.x / C), Math.floor(p.z / C)));
    if (!near) return;
    for (const b of near) {
      if (p.x < b.min.x - r || p.x > b.max.x + r || p.y < b.min.y - r || p.y > b.max.y + r || p.z < b.min.z - r || p.z > b.max.z + r) continue;
      // Push out along the axis of least penetration.
      const dx1 = p.x - (b.min.x - r), dx2 = b.max.x + r - p.x;
      const dy1 = p.y - (b.min.y - r), dy2 = b.max.y + r - p.y;
      const dz1 = p.z - (b.min.z - r), dz2 = b.max.z + r - p.z;
      const m = Math.min(dx1, dx2, dy1, dy2, dz1, dz2);
      if (m === dx1) { p.x = b.min.x - r; this.velocity.x = Math.min(0, this.velocity.x); }
      else if (m === dx2) { p.x = b.max.x + r; this.velocity.x = Math.max(0, this.velocity.x); }
      else if (m === dy1) { p.y = b.min.y - r; this.velocity.y = Math.min(0, this.velocity.y); }
      else if (m === dy2) { p.y = b.max.y + r; this.velocity.y = Math.max(0, this.velocity.y); }
      else if (m === dz1) { p.z = b.min.z - r; this.velocity.z = Math.min(0, this.velocity.z); }
      else { p.z = b.max.z + r; this.velocity.z = Math.max(0, this.velocity.z); }
    }
  }

  applyToCamera(camera: THREE.PerspectiveCamera) {
    camera.position.copy(this.position);
    this.orientation(camera.quaternion);
  }

  dispose() {
    if (document.pointerLockElement === this.dom) document.exitPointerLock();
    this.disposers.forEach((d) => d());
    this.disposers = [];
  }
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
}

export function formatSpeed(mps: number, units: 'metric' | 'imperial'): string {
  if (mps >= SPEED_OF_LIGHT * 0.01) return `${(mps / SPEED_OF_LIGHT).toFixed(mps >= SPEED_OF_LIGHT * 0.1 ? 3 : 4)} c`;
  const mach = mps / SPEED_OF_SOUND;
  if (mach >= 1000) return `Mach ${Math.round(mach).toLocaleString('en-US')}`;
  if (mach >= 0.8) return `Mach ${mach.toFixed(2)}`;
  if (units === 'imperial') {
    const mph = mps * 2.23694;
    if (mph >= 1) return `${mph.toFixed(mph < 10 ? 1 : 0)} mph`;
    const ips = mps * 39.3701;
    return `${ips.toFixed(ips < 1 ? 3 : 2)} in/s`;
  }
  if (mps >= 10) return `${(mps * 3.6).toFixed(0)} km/h`;
  if (mps >= 1) return `${mps.toFixed(1)} m/s`;
  if (mps >= 0.01) return `${(mps * 100).toFixed(1)} cm/s`;
  return `${(mps * 1000).toFixed(mps < 0.001 ? 2 : 1)} mm/s`;
}

export function formatDistance(m: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') {
    const ft = m * 3.28084;
    const mi = ft / 5280;
    if (mi >= 100) return `${Math.round(mi).toLocaleString('en-US')} mi`;
    return ft >= 5280 ? `${mi.toFixed(2)} mi` : `${ft.toFixed(ft < 10 ? 2 : 0)} ft`;
  }
  if (m >= 100000) return `${Math.round(m / 1000).toLocaleString('en-US')} km`;
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  if (m >= 1) return `${m.toFixed(1)} m`;
  return `${(m * 100).toFixed(1)} cm`;
}
