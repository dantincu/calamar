import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { Topology } from 'topojson-specification';
import countriesUrl from 'world-atlas/countries-50m.json?url';
import type { Quality } from '../../../settings/settings';
import { CITIES } from './data/cities';
import { SEAS } from './data/terrain';
import { EarthFrame, formatLatLon, greatCircle } from './geo';
import { countryAt, decodeWorld, paintEarth, type WorldShapes } from './paint';

const TEXTURE_WIDTH: Record<Quality, number> = { low: 2048, medium: 4096, high: 8192 };

const globeVertex = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vToEye;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vToEye = cameraPosition - wp.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <logdepthbuf_vertex>
    #include <fog_vertex>
  }
`;

const globeFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D waterMap;
  uniform sampler2D detailMap;
  uniform vec3 sunDir;
  uniform float lightsGain;
  #include <common>
  #include <fog_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vToEye;
  void main() {
    #include <logdepthbuf_fragment>
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(vToEye);
    float ndl = dot(n, sunDir);
    float dayAmt = smoothstep(-0.10, 0.14, ndl);
    vec3 albedo = texture2D(dayMap, vUv).rgb;
    float water = texture2D(waterMap, vUv).r;
    // up close the map alone is a smear: modulate it with fine tiled noise (two octaves, ~40 m and ~5 m texels)
    float near = 1.0 - smoothstep(15000.0, 300000.0, length(vToEye));
    if (near > 0.0) {
      float d1 = texture2D(detailMap, vUv * vec2(2048.0, 1024.0)).r - 0.5;
      float d2 = texture2D(detailMap, vUv * vec2(16384.0, 8192.0)).r - 0.5;
      albedo *= 1.0 + (d1 * 0.55 + d2 * 0.3) * near * (1.0 - water * 0.8);
    }
    vec3 col = albedo * (max(ndl, 0.0) * 2.1 + 0.025);
    // sunglint on open water
    vec3 h = normalize(sunDir + v);
    col += vec3(1.0, 0.92, 0.8) * pow(max(dot(n, h), 0.0), 80.0) * water * dayAmt * 0.9;
    // city lights on the night side
    col += texture2D(nightMap, vUv).rgb * (1.0 - dayAmt) * lightsGain;
    // a blue veil towards the limb on the day side
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    col = mix(col, vec3(0.35, 0.55, 0.95) * (0.2 + max(ndl, 0.0)), rim * 0.55 * smoothstep(-0.2, 0.3, ndl));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const atmosphereVertex = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vWorld;
  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 center;
  uniform float radius;
  uniform vec3 sunDir;
  uniform float fade;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  varying vec3 vWorld;
  void main() {
    #include <logdepthbuf_fragment>
    // how close the line of sight passes to the planet decides how much air it crosses
    vec3 rd = normalize(vWorld - cameraPosition);
    float t = max(dot(center - cameraPosition, rd), 0.0);
    vec3 closest = cameraPosition + rd * t - center;
    float d = length(closest);
    float h = d - radius;
    float glow = h >= 0.0 ? exp(-h / 14000.0) : exp(h / 30000.0);
    float lit = smoothstep(-0.3, 0.35, dot(closest / max(d, 1.0), sunDir));
    vec3 col = mix(vec3(0.12, 0.3, 0.9), vec3(0.45, 0.65, 1.0), glow) * glow * lit * 0.75 * fade;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Seamless value noise, two octaves, for close-up detail on the globe. */
function detailTexture(anisotropy: number, keep: THREE.Texture[]): THREE.Texture {
  const N = 256;
  const data = new Uint8Array(N * N * 4);
  let s = 99;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const octave = (cells: number) => {
    const g = Array.from({ length: cells * cells }, rand);
    return (x: number, y: number) => {
      const fx = (x / N) * cells, fy = (y / N) * cells;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const at = (i: number, j: number) => g[((j % cells) * cells) + (i % cells)]; // wraps: seamless
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      return a + (b - a) * sy;
    };
  };
  const o1 = octave(8), o2 = octave(32), o3 = octave(128);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = o1(x, y) * 0.5 + o2(x, y) * 0.3 + o3(x, y) * 0.2;
      const i = (y * N + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(v * 255);
      data[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, N, N);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = anisotropy;
  t.needsUpdate = true;
  keep.push(t);
  return t;
}

interface MapLabel {
  obj: CSS2DObject;
  /** Shown only when the eye is closer than this, metres. */
  maxDist: number;
  /** ...and higher than this above the surface. */
  minAlt: number;
  maxAlt: number;
}

/**
 * The whole Earth at a coarse level of detail: Natural Earth countries painted with climate zones,
 * relief, ice and lakes, city lights on the night side, an atmosphere, and labels for countries,
 * cities and seas. It is drawn first and writes no depth, so the engine's detailed local scene
 * always sits on top of it; hide that scene when it is behind the horizon.
 */
export class Earth {
  /** Globe and atmosphere, placed at the planet's centre. */
  readonly group = new THREE.Group();
  /** Map labels, in local coordinates. */
  readonly labels = new THREE.Group();
  private globe: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private atmosphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private textures: THREE.Texture[] = [];
  private mapLabels: MapLabel[] = [];
  private tmp = new THREE.Vector3();

  /** Downloads and decodes the country shapes; start it early, it runs while the engine builds its scene. */
  static async fetchShapes(): Promise<WorldShapes> {
    const res = await fetch(countriesUrl);
    if (!res.ok) throw new Error(`Could not load the world map (${res.status})`);
    return decodeWorld((await res.json()) as Topology);
  }

  /** Paints the maps (about a second at medium quality) and builds the globe. */
  static create(frame: EarthFrame, shapes: WorldShapes, renderer: THREE.WebGLRenderer, quality: Quality): Earth {
    const W = Math.min(TEXTURE_WIDTH[quality], renderer.capabilities.maxTextureSize);
    return new Earth(frame, shapes, W, renderer);
  }

  private constructor(readonly frame: EarthFrame, readonly world: WorldShapes, textureWidth: number, renderer: THREE.WebGLRenderer) {
    const maps = paintEarth(world, textureWidth);
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const tex = (c: HTMLCanvasElement, srgb: boolean) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = aniso;
      this.textures.push(t);
      return t;
    };

    const R = frame.radius;
    const globeMat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        dayMap: { value: tex(maps.day, true) },
        nightMap: { value: tex(maps.night, true) },
        waterMap: { value: tex(maps.water, false) },
        detailMap: { value: detailTexture(aniso, this.textures) },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        lightsGain: { value: 1.2 },
      },
      vertexShader: globeVertex,
      fragmentShader: globeFragment,
      fog: true,
      depthWrite: false,
    });
    // 0.5° steps: chords sag at most ~60 m under the true sphere, safely below the drone's floor
    this.globe = new THREE.Mesh(new THREE.SphereGeometry(R, 720, 360), globeMat);
    this.globe.renderOrder = -0.5;
    this.globe.frustumCulled = false;

    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        center: { value: frame.center.clone() },
        radius: { value: R },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        fade: { value: 0 },
      },
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(new THREE.SphereGeometry(R + 160000, 192, 96), atmoMat);
    this.atmosphere.frustumCulled = false;

    this.group.position.copy(frame.center);
    this.group.quaternion.copy(frame.quaternion);
    this.group.add(this.globe, this.atmosphere);

    this.buildLabels();
  }

  private addLabel(text: string, kind: string, lat: number, lon: number, maxDist: number, minAlt: number, maxAlt = Infinity) {
    const div = document.createElement('div');
    div.className = `map-label ${kind}`;
    div.textContent = text;
    const obj = new CSS2DObject(div);
    this.frame.toLocal(lat, lon, 0, obj.position);
    obj.visible = false;
    this.labels.add(obj);
    this.mapLabels.push({ obj, maxDist, minAlt, maxAlt });
  }

  private buildLabels() {
    for (const c of this.world.countries) {
      if (c.areaKm2 < 300) continue;
      const maxDist = THREE.MathUtils.clamp(Math.sqrt(c.areaKm2) * 5.5, 500, 22000) * 1000;
      this.addLabel(c.name, 'country', c.label[1], c.label[0], maxDist, 120000);
    }
    for (const [name, lat, lon, pop] of CITIES) {
      const maxDist = (150 + 260 * Math.sqrt(pop)) * 1000;
      this.addLabel(name, 'city', lat, lon, maxDist, 1500, 2500000);
    }
    for (const [name, lat, lon] of SEAS) {
      const ocean = name.endsWith('Ocean');
      this.addLabel(name, ocean ? 'sea ocean' : 'sea', lat, lon, (ocean ? 16000 : 3500) * 1000, ocean ? 400000 : 150000);
    }
  }

  /**
   * @param sunDir unit vector towards the sun in local coordinates
   * @param altitude the eye's height above the surface, metres
   * @param hideNear labels within this distance of `near` are left to the local scene
   */
  update(camera: THREE.Camera, sunDir: THREE.Vector3, altitude: number, near: THREE.Vector3, hideNear: number) {
    const eye = camera.position;
    this.globe.material.uniforms.sunDir.value.copy(sunDir);
    const am = this.atmosphere.material.uniforms;
    am.sunDir.value.copy(sunDir);
    am.fade.value = THREE.MathUtils.smoothstep(altitude, 25000, 110000);
    this.atmosphere.visible = am.fade.value > 0;

    const nearLocal = eye.distanceTo(near) < hideNear;
    for (const l of this.mapLabels) {
      const p = l.obj.position;
      const d = this.tmp.copy(p).sub(eye).length();
      l.obj.visible =
        altitude >= l.minAlt &&
        altitude <= l.maxAlt &&
        d < l.maxDist &&
        !this.frame.occluded(p, eye, 2000) &&
        !(nearLocal && p.distanceTo(near) < hideNear);
    }
  }

  /** Country (or sea) under a point, and its coordinates. */
  locate(p: THREE.Vector3): string {
    const g = this.frame.toGeo(p);
    const coords = formatLatLon(g.lat, g.lon);
    const country = countryAt(this.world.countries, g.lon, g.lat);
    if (country) return `${country.name} · ${coords}`;
    let best = '', bestD = Infinity;
    for (const [name, lat, lon] of SEAS) {
      const d = greatCircle(g.lat, g.lon, lat, lon);
      if (d < bestD) {
        bestD = d;
        best = name;
      }
    }
    return `${best ? `${best} · ` : ''}${coords}`;
  }

  dispose() {
    this.globe.geometry.dispose();
    this.globe.material.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphere.material.dispose();
    this.textures.forEach((t) => t.dispose());
    this.mapLabels.forEach((l) => l.obj.element.remove());
    this.group.removeFromParent();
    this.labels.removeFromParent();
  }
}
