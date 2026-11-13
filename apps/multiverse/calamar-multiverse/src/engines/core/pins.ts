import * as THREE from 'three';
import type { SpawnPoint } from './types';

/** A place the user saved, like a pin on a map: where the drone was and which way it looked. */
export interface Pin {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  /** Relative to local north and up, as spawn points are. */
  yaw: number;
  pitch: number;
  createdAt: string;
}

const key = (engineId: string) => `calamar-multiverse.pins.v1.${engineId}`;

const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

export function loadPins(engineId: string): Pin[] {
  try {
    const raw = localStorage.getItem(key(engineId));
    if (!raw) return [];
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return [];
    return list.filter(
      (p): p is Pin =>
        !!p && typeof p.id === 'string' && typeof p.name === 'string' && [p.x, p.y, p.z, p.yaw, p.pitch].every(finite),
    );
  } catch {
    return [];
  }
}

export function savePins(engineId: string, pins: Pin[]) {
  try {
    localStorage.setItem(key(engineId), JSON.stringify(pins));
  } catch {
    /* storage unavailable or full: the pins live until the page closes */
  }
}

export function pinPosition(p: Pin, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(p.x, p.y, p.z);
}

export function pinSpawn(p: Pin): SpawnPoint {
  return { position: pinPosition(p), yaw: p.yaw, pitch: p.pitch };
}

export function newPinId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
