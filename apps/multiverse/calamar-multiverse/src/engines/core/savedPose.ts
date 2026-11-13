import * as THREE from 'three';
import type { SpawnPoint } from './types';
import type { DroneController } from './DroneController';

/** Where the drone was when the user last left an engine, kept per engine in localStorage. */
export interface SavedPose extends SpawnPoint {
  cruiseSpeed: number;
}

const key = (engineId: string) => `calamar-multiverse.pose.v1.${engineId}`;

export function loadPose(engineId: string): SavedPose | null {
  try {
    const raw = localStorage.getItem(key(engineId));
    if (!raw) return null;
    const p = JSON.parse(raw) as { x: number; y: number; z: number; yaw: number; pitch: number; cruiseSpeed: number };
    const nums = [p.x, p.y, p.z, p.yaw, p.pitch, p.cruiseSpeed];
    if (!nums.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
    return { position: new THREE.Vector3(p.x, p.y, p.z), yaw: p.yaw, pitch: p.pitch, cruiseSpeed: p.cruiseSpeed };
  } catch {
    return null;
  }
}

export function savePose(engineId: string, drone: DroneController) {
  try {
    const { x, y, z } = drone.position;
    const { yaw, pitch } = drone.localYawPitch(); // relative to local north and up, as spawn points are
    localStorage.setItem(key(engineId), JSON.stringify({ x, y, z, yaw, pitch, cruiseSpeed: drone.cruiseSpeed }));
  } catch {
    /* storage unavailable: nothing to do */
  }
}
