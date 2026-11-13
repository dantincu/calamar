import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { EngineInfo } from '../registry';
import type { EngineWorld, Planet, Viewpoint } from './types';
import { DroneController, MAX_SPEED, MIN_SPEED, SPEED_OF_LIGHT, SPEED_OF_SOUND, SPEED_PRESETS, formatDistance, formatSpeed } from './DroneController';
import { loadPose, savePose } from './savedPose';
import { loadPins, newPinId, pinPosition, pinSpawn, savePins, type Pin } from './pins';
import { useSettings, type Quality, type Settings } from '../../settings/settings';
import { useFullscreen } from '../../components/fullscreen';
import { CloseIcon, FullscreenIcon, PinIcon } from '../../components/Icons';

interface HudState {
  speed: string;
  cruise: number;
  altitude: string;
  heading: number;
  location: string;
  fps: number;
}

const PIXEL_RATIO: Record<Quality, number> = { low: 0.75, medium: 1.25, high: 2 };

export function EngineViewport({ engine }: { engine: EngineInfo }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { immersive, toggle: toggleFullscreen } = useFullscreen();
  const settingsRef = useRef<Settings>(settings);
  const worldRef = useRef<EngineWorld | null>(null);
  const droneRef = useRef<DroneController | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const toggleFsRef = useRef(toggleFullscreen);
  toggleFsRef.current = toggleFullscreen;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [viewpoints, setViewpoints] = useState<Viewpoint[]>([]);
  const [toast, setToast] = useState('');
  const [hud, setHud] = useState<HudState>({ speed: '0', cruise: 0, altitude: '', heading: 0, location: '', fps: 0 });
  const [pins, setPins] = useState<Pin[]>(() => loadPins(engine.id));
  const [pinsOpen, setPinsOpen] = useState(false);
  const pinSceneRef = useRef(new THREE.Scene());

  const setCruise = (mps: number) => {
    const drone = droneRef.current;
    if (!drone || !Number.isFinite(mps)) return;
    drone.cruiseSpeed = THREE.MathUtils.clamp(mps, MIN_SPEED, MAX_SPEED);
    setHud((h) => ({ ...h, cruise: drone.cruiseSpeed }));
  };

  const addPin = () => {
    const drone = droneRef.current;
    if (!drone) return;
    const p = drone.position;
    const { yaw, pitch } = drone.localYawPitch();
    const name = uniqueName(worldRef.current?.locate?.(p) || 'Pinned place', pins);
    setPins((list) => [...list, { id: newPinId(), name, x: p.x, y: p.y, z: p.z, yaw, pitch, createdAt: new Date().toISOString() }]);
    setToast(`Pinned: ${name}`);
  };

  const goToPin = (pin: Pin) => {
    droneRef.current?.teleport(pinSpawn(pin));
    setToast(pin.name);
  };

  const togglePins = () => {
    setPinsOpen((open) => {
      if (!open && document.pointerLockElement) document.exitPointerLock(); // the list needs the mouse
      return !open;
    });
  };

  // the engine's key hook is set up once; it reaches the current handlers through this ref
  const actionsRef = useRef({ addPin, togglePins, goToPin });
  actionsRef.current = { addPin, togglePins, goToPin };

  useEffect(() => savePins(engine.id, pins), [engine.id, pins]);

  // one marker per pin, drawn by its own label layer so it shows even with labels turned off
  useEffect(() => {
    const scene = pinSceneRef.current;
    scene.clear(); // removing a CSS2DObject removes its element too
    for (const pin of pins) {
      const el = document.createElement('button');
      el.className = 'pin-marker';
      el.title = `${pin.name} — click to go there`;
      el.innerHTML = '<span class="pin-head"></span><span class="pin-name"></span>';
      el.querySelector('.pin-name')!.textContent = pin.name;
      el.addEventListener('click', () => actionsRef.current.goToPin(pin));
      const obj = new CSS2DObject(el);
      obj.center.set(0.5, 1); // the pin's point sits on the place
      pinPosition(pin, obj.position);
      scene.add(obj);
    }
  }, [pins]);

  // Build the renderer and the world once per engine.
  useEffect(() => {
    const host = hostRef.current!;
    let disposed = false;
    const s = settingsRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO[s.quality]));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = s.quality !== 'low';
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.className = 'engine-canvas';
    host.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labels = new CSS2DRenderer();
    labels.domElement.className = 'engine-labels';
    host.appendChild(labels.domElement);
    const pinLayer = new CSS2DRenderer();
    pinLayer.domElement.className = 'engine-pins';
    host.appendChild(pinLayer.domElement);
    const pinScene = pinSceneRef.current;

    const scene = new THREE.Scene();
    // 2 mm to a million million metres (~7 times the Sun's distance): at light speed the drone gets far;
    // the logarithmic depth buffer copes with both a snail's view and the Earth seen from deep space
    const camera = new THREE.PerspectiveCamera(s.fov, 1, 0.002, 1e12);
    cameraRef.current = camera;

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      labels.setSize(w, h);
      pinLayer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let frame = 0;
    let drone: DroneController | null = null;
    let world: EngineWorld | null = null;
    let saveTimer = 0;
    let stopSaving = () => {};

    (async () => {
      try {
        const mod = await engine.load();
        if (disposed) return;
        world = await mod.createWorld({ renderer, scene, camera, settings: s });
        if (disposed) {
          world.dispose();
          return;
        }
        worldRef.current = world;
        // resume where the user left this engine, if anywhere
        const saved = loadPose(engine.id);
        drone = new DroneController(renderer.domElement, saved ?? world.spawn, world.planet ?? null);
        if (saved) drone.cruiseSpeed = THREE.MathUtils.clamp(saved.cruiseSpeed, MIN_SPEED, MAX_SPEED);
        const save = () => drone && savePose(engine.id, drone);
        window.addEventListener('pagehide', save);
        saveTimer = window.setInterval(save, 2000);
        stopSaving = () => {
          window.removeEventListener('pagehide', save);
          clearInterval(saveTimer);
          save();
        };
        drone.sensitivity = s.mouseSensitivity;
        drone.invertY = s.invertY;
        drone.onPointerLockChange = setLocked;
        const vps = world.viewpoints ?? [];
        let vpIndex = -1;
        drone.onKey = (code) => {
          if (code === 'KeyP') {
            actionsRef.current.addPin();
            return true;
          }
          if (code === 'KeyL') {
            actionsRef.current.togglePins();
            return true;
          }
          if (code === 'KeyF') {
            toggleFsRef.current();
            return true;
          }
          if (code === 'KeyH') {
            setShowHelp((v) => !v);
            return true;
          }
          if (code === 'KeyR') {
            drone!.teleport(world!.spawn);
            return true;
          }
          if (code === 'KeyV' && vps.length > 0) {
            vpIndex = (vpIndex + 1) % vps.length;
            const vp = vps[vpIndex];
            drone!.teleport(vp);
            setToast(`${vpIndex + 1}/${vps.length} · ${vp.name}`);
            return true;
          }
          return false;
        };
        droneRef.current = drone;
        setViewpoints(vps);
        setStatus('ready');

        const timer = new THREE.Timer();
        timer.connect(document);
        let hudTimer = 0;
        let frames = 0;
        let elapsed = 0;
        const loop = () => {
          frame = requestAnimationFrame(loop);
          timer.update();
          const dt = Math.min(timer.getDelta(), 0.1);
          elapsed += dt;
          drone!.update(dt, world!.colliders, world!.groundHeight);
          drone!.applyToCamera(camera);
          world!.update(dt, elapsed, camera);
          renderer.render(scene, camera);
          if (settingsRef.current.showLabels) labels.render(scene, camera);
          for (const m of pinScene.children) {
            const d = m.position.distanceTo(camera.position);
            m.visible = d > 3 && !(world!.planet && hiddenByPlanet(camera.position, m.position, world!.planet));
          }
          pinLayer.render(pinScene, camera);
          frames++;
          hudTimer += dt;
          if (hudTimer >= 0.15) {
            const st = settingsRef.current;
            const p = drone!.position;
            setHud({
              speed: formatSpeed(drone!.speed, st.speedUnits),
              cruise: drone!.cruiseSpeed,
              altitude: formatDistance(Math.max(0, altitudeOf(world!, p)), st.speedUnits),
              heading: drone!.heading,
              location: world!.locate?.(p) ?? '',
              fps: Math.round(frames / hudTimer),
            });
            hudTimer = 0;
            frames = 0;
          }
        };
        loop();
      } catch (e) {
        console.error(e);
        if (!disposed) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      }
    })();

    return () => {
      disposed = true;
      stopSaving(); // remember where the drone is before tearing it down
      cancelAnimationFrame(frame);
      ro.disconnect();
      drone?.dispose();
      world?.dispose();
      worldRef.current = null;
      droneRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
      pinLayer.domElement.remove();
    };
  }, [engine]);

  // Push settings changes into the running engine.
  useEffect(() => {
    const prev = settingsRef.current;
    settingsRef.current = settings;
    const drone = droneRef.current;
    if (drone) {
      drone.sensitivity = settings.mouseSensitivity;
      drone.invertY = settings.invertY;
    }
    const cam = cameraRef.current;
    if (cam && cam.fov !== settings.fov) {
      cam.fov = settings.fov;
      cam.updateProjectionMatrix();
    }
    const r = rendererRef.current;
    if (r && prev.quality !== settings.quality) {
      r.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO[settings.quality]));
      r.shadowMap.enabled = settings.quality !== 'low';
      r.shadowMap.needsUpdate = true;
    }
    worldRef.current?.applySettings(settings);
    const labelsEl = hostRef.current?.querySelector<HTMLElement>('.engine-labels');
    if (labelsEl) labelsEl.style.display = settings.showLabels ? '' : 'none';
  }, [settings, status]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="engine-viewport" ref={hostRef}>
      {status === 'loading' && <div className="engine-message">Building {engine.name}…</div>}
      {status === 'error' && <div className="engine-message error">Could not start the engine: {error}</div>}

      {status === 'ready' && settings.showHud && (
        <>
          <div className="crosshair" />
          <div className="hud hud-top-left">
            <div className="hud-title">{engine.name}</div>
            <div className="hud-location">{hud.location}</div>
          </div>
          <Compass heading={hud.heading} />
          <div className="hud hud-bottom-left">
            <div><span className="hud-k">Speed</span> {hud.speed}</div>
            <div className="hud-cruise">
              <span className="hud-k">Cruise</span>
              <CruiseControl value={hud.cruise} imperial={settings.speedUnits === 'imperial'} onSet={setCruise} />
            </div>
            <div><span className="hud-k">Altitude</span> {hud.altitude}</div>
            <div className="hud-dim">{hud.fps} fps</div>
          </div>
        </>
      )}

      {status === 'ready' && (
        <>
          <button className="viewport-fs-btn" title={immersive ? 'Exit full screen (Esc)' : 'Full screen (F)'} onClick={toggleFullscreen}>
            <FullscreenIcon />
          </button>
          <button
            className={`viewport-fs-btn viewport-pins-btn${pinsOpen ? ' active' : ''}`}
            title="Saved places (L) · pin this place (P)"
            aria-label="Saved places"
            onMouseDown={(e) => e.preventDefault()}
            onClick={togglePins}
          >
            <PinIcon />
            {pins.length > 0 && <span className="pins-count">{pins.length}</span>}
          </button>
        </>
      )}

      {status === 'ready' && pinsOpen && (
        <PinsPanel
          pins={pins}
          here={droneRef.current?.position ?? null}
          imperial={settings.speedUnits === 'imperial'}
          onAdd={addPin}
          onGo={goToPin}
          onRename={(id, name) => setPins((list) => list.map((p) => (p.id === id ? { ...p, name } : p)))}
          onDelete={(id) => setPins((list) => list.filter((p) => p.id !== id))}
          onClose={() => setPinsOpen(false)}
        />
      )}

      {status === 'ready' && showHelp && (
        <div className="hud hud-help">
          <div className="hud-help-title">Drone controls <span className="hud-dim">(H to hide)</span></div>
          <table>
            <tbody>
              <tr><td>Click</td><td>take control (Esc releases the mouse)</td></tr>
              <tr><td>Mouse</td><td>look around</td></tr>
              <tr><td>W A S D / arrows</td><td>fly where you look / strafe</td></tr>
              <tr><td>Space, E / C, Q</td><td>rise / sink</td></tr>
              <tr><td>Wheel, + / −</td><td>cruise speed ×1.25 (or type it in the speed box, up to light speed)</td></tr>
              <tr><td>Shift / Alt</td><td>boost ×5 / creep ×0.2</td></tr>
              <tr><td>X</td><td>stop dead · no keys = hover</td></tr>
              <tr><td>1 … 0</td><td>{SPEED_PRESETS.map((p) => `${p.key} ${p.label}`).join(' · ')}</td></tr>
              {viewpoints.length > 0 && (
                <tr><td>V</td><td>next viewpoint ({viewpoints.map((v) => v.name).join(' · ')})</td></tr>
              )}
              <tr><td>P / L</td><td>pin this place / saved places (click a pin to go there)</td></tr>
              <tr><td>R / F</td><td>back to the starting point / full screen (Esc exits)</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {status === 'ready' && !locked && <div className="click-to-fly">Click to fly</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/** Whether the planet stands between the eye and a point (the point may be in the air). */
function hiddenByPlanet(eye: THREE.Vector3, p: THREE.Vector3, planet: Planet): boolean {
  const c = planet.center;
  const dx = p.x - eye.x, dy = p.y - eye.y, dz = p.z - eye.z;
  const len2 = dx * dx + dy * dy + dz * dz;
  if (len2 === 0) return false;
  const t = ((c.x - eye.x) * dx + (c.y - eye.y) * dy + (c.z - eye.z) * dz) / len2;
  if (t <= 0 || t >= 1) return false; // the closest approach to the centre is outside the segment
  const qx = eye.x + dx * t - c.x, qy = eye.y + dy * t - c.y, qz = eye.z + dz * t - c.z;
  return Math.sqrt(qx * qx + qy * qy + qz * qz) < planet.radius - 50; // 50 m of slack for pins at ground level
}

function uniqueName(base: string, pins: Pin[]): string {
  const names = new Set(pins.map((p) => p.name));
  if (!names.has(base)) return base;
  for (let i = 2; ; i++) if (!names.has(`${base} (${i})`)) return `${base} (${i})`;
}

type SpeedUnit = 'mm/s' | 'm/s' | 'km/h' | 'mph' | 'Mach' | 'c';
const UNIT_MPS: Record<SpeedUnit, number> = { 'mm/s': 0.001, 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, Mach: SPEED_OF_SOUND, c: SPEED_OF_LIGHT };

/** The unit a speed reads best in. */
function autoUnit(mps: number, imperial: boolean): SpeedUnit {
  if (mps >= SPEED_OF_LIGHT * 0.01) return 'c';
  if (mps >= SPEED_OF_SOUND * 0.8) return 'Mach';
  if (mps >= 10) return imperial ? 'mph' : 'km/h';
  if (mps >= 0.01) return 'm/s';
  return 'mm/s';
}

/** At most four significant digits, without an exponent where avoidable. */
function plainNumber(v: number): string {
  const n = Number(v.toPrecision(4));
  return Math.abs(n) >= 1e21 || (n !== 0 && Math.abs(n) < 1e-6) ? n.toPrecision(4) : n.toLocaleString('en-US', { maximumSignificantDigits: 4, useGrouping: false });
}

/**
 * The cruise speed as a box you can type into, with a unit and ÷10 / ×10 buttons.
 * The unit follows the speed ("auto") until one is picked.
 */
function CruiseControl({ value, imperial, onSet }: { value: number; imperial: boolean; onSet: (mps: number) => void }) {
  const [picked, setPicked] = useState<SpeedUnit | null>(null);
  const [text, setText] = useState<string | null>(null); // non-null while typing
  const cancelled = useRef(false);
  const unit = picked ?? autoUnit(value, imperial);
  const shown = text ?? plainNumber(value / UNIT_MPS[unit]);

  const commit = () => {
    if (text !== null && !cancelled.current) {
      const v = Number(text.trim().replace(',', '.'));
      if (Number.isFinite(v) && v > 0) onSet(v * UNIT_MPS[unit]);
    }
    cancelled.current = false;
    setText(null);
  };
  const noFocus = (e: { preventDefault(): void }) => e.preventDefault(); // keep Space for flying, not for pressing the button

  return (
    <span className="cruise-control">
      <button title="Cruise speed ÷10" onMouseDown={noFocus} onClick={() => onSet(value / 10)}>÷10</button>
      <input
        aria-label="Cruise speed"
        inputMode="decimal"
        value={shown}
        onFocus={(e) => {
          setText(plainNumber(value / UNIT_MPS[unit]));
          e.currentTarget.select();
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
      />
      <select
        aria-label="Cruise speed unit"
        value={picked ?? 'auto'}
        onChange={(e) => {
          setPicked(e.target.value === 'auto' ? null : (e.target.value as SpeedUnit));
          e.currentTarget.blur();
        }}
      >
        <option value="auto">auto · {autoUnit(value, imperial)}</option>
        {(Object.keys(UNIT_MPS) as SpeedUnit[]).map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
      <button title="Cruise speed ×10" onMouseDown={noFocus} onClick={() => onSet(value * 10)}>×10</button>
    </span>
  );
}

interface PinsPanelProps {
  pins: Pin[];
  here: THREE.Vector3 | null;
  imperial: boolean;
  onAdd(): void;
  onGo(pin: Pin): void;
  onRename(id: string, name: string): void;
  onDelete(id: string): void;
  onClose(): void;
}

/** The list of saved places: go to one, rename it, remove it, or pin where you are. */
function PinsPanel({ pins, here, imperial, onAdd, onGo, onRename, onDelete, onClose }: PinsPanelProps) {
  const tmp = new THREE.Vector3();
  const units = imperial ? 'imperial' : 'metric';
  return (
    <div className="pins-panel" role="dialog" aria-label="Saved places">
      <div className="pins-header">
        <span>Saved places</span>
        <button className="pins-add" onClick={onAdd} title="Pin where the drone is (P)">
          <PinIcon /> Pin this place
        </button>
        <button className="pins-close" onClick={onClose} title="Close (L)" aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      {pins.length === 0 ? (
        <p className="pins-empty">No saved places yet. Fly somewhere and press P (or the button above) to drop a pin.</p>
      ) : (
        <ul className="pins-list">
          {pins.map((pin) => (
            <li key={pin.id}>
              <input
                aria-label="Place name"
                value={pin.name}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => onRename(pin.id, e.target.value)}
                onBlur={(e) => !e.target.value.trim() && onRename(pin.id, 'Unnamed place')}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
              <span className="pins-meta">{here ? `${formatDistance(pinPosition(pin, tmp).distanceTo(here), units)} away` : ''}</span>
              <button className="pins-go" onClick={() => onGo(pin)}>Go</button>
              <button className="pins-delete" onClick={() => onDelete(pin.id)} title="Remove this pin" aria-label={`Remove ${pin.name}`}>
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Height above the detailed ground where there is some, otherwise above the planet's surface. */
function altitudeOf(world: EngineWorld, p: THREE.Vector3): number {
  const gh = world.groundHeight(p.x, p.z);
  if (Number.isFinite(gh)) return p.y - gh;
  return world.planet ? p.distanceTo(world.planet.center) - world.planet.radius : p.y;
}

function Compass({ heading }: { heading: number }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const marks = [];
  for (let d = 0; d < 360; d += 15) {
    let off = d - heading;
    off = ((off + 540) % 360) - 180;
    if (Math.abs(off) > 75) continue;
    const isCardinal = d % 45 === 0;
    marks.push(
      <div key={d} className={`compass-mark${isCardinal ? ' major' : ''}`} style={{ left: `${50 + (off / 75) * 50}%` }}>
        {isCardinal ? dirs[d / 45] : ''}
      </div>,
    );
  }
  return (
    <div className="hud compass">
      {marks}
      <div className="compass-needle" />
      <div className="compass-value">{Math.round(heading)}°</div>
    </div>
  );
}
