import type * as THREE from 'three';
import type { Settings } from '../../settings/settings';

/** Everything an engine gets to build its world. */
export interface EngineContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  settings: Settings;
}

export interface SpawnPoint {
  position: THREE.Vector3;
  /**
   * Radians, 0 = looking north (-Z), positive turns left (counter-clockwise seen from above).
   * On a planet, yaw and pitch are relative to the local east/up/north at the position.
   */
  yaw: number;
  /** Radians, positive looks up. */
  pitch: number;
}

/** A named viewpoint the user can jump to with the keys shown in the HUD. */
export interface Viewpoint extends SpawnPoint {
  name: string;
}

/** A round world under the engine's flat local frame: "up" points away from its centre. */
export interface Planet {
  center: THREE.Vector3;
  radius: number;
  /** Orientation whose +X is east, +Y up and -Z north at a point (yaw and pitch are relative to it). */
  alignedFrame(p: THREE.Vector3, out: THREE.Quaternion): THREE.Quaternion;
}

/** A world built by an engine: the viewport drives it every frame. */
export interface EngineWorld {
  spawn: SpawnPoint;
  viewpoints?: Viewpoint[];
  /** Solid axis-aligned boxes the drone can't fly through. */
  colliders: THREE.Box3[];
  /**
   * Height of the engine's detailed ground (y) under a point, or -Infinity where it has none
   * (then the planet's surface, if there is one, is the floor).
   */
  groundHeight(x: number, z: number): number;
  /** The globe the local scene sits on, if any. */
  planet?: Planet;
  /** A short description of where the point is, for the HUD. */
  locate?(position: THREE.Vector3): string;
  update(dt: number, elapsed: number, camera: THREE.PerspectiveCamera): void;
  applySettings(settings: Settings): void;
  dispose(): void;
}

export interface EngineModule {
  createWorld(ctx: EngineContext): EngineWorld | Promise<EngineWorld>;
}
