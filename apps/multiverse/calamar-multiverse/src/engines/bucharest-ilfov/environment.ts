import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import type { Quality } from '../../settings/settings';

const DEG = Math.PI / 180;
const BUCHAREST_LAT = 44.44;
/** The sun's declination at a solstice. */
const SOLSTICE_DECLINATION = 23.44;
/**
 * A clear, dry summer day: little aerosol (turbidity 2), a tight glow around the sun, no clouds, and
 * about 40 km of visibility (the fog hides ~10% at 10 km, ~60% at 25 km, ~90% at 40 km).
 */
const RAYLEIGH = 1.3;
const MIE = 0.0025;
const FOG_DENSITY = 0.00004;
/** Brightness and saturation applied to the sky shader's output. */
const SKY_GAIN = 0.42;
const SKY_SATURATION = 1.7;
/** Sunlight at the ground: warm yellow-white at midday (~5000 K against the blue sky fill), orange when low. */
const SUN_HIGH = new THREE.Color(0xffedcc);
const SUN_LOW = new THREE.Color(0xf4b871);

/**
 * The sun's declination on the local summer solstice: +23.44° (June) in the north, −23.44° (December) in the south.
 * Within 5° of the equator it is blended, so that crossing the equator doesn't make the sun jump 47° across the sky.
 */
export function summerDeclination(latDeg: number): number {
  return SOLSTICE_DECLINATION * THREE.MathUtils.clamp(latDeg / 5, -1, 1);
}

/**
 * Unit vector towards the sun at a local hour (x east, y up, -z north), at a latitude and declination.
 * The hour is local solar time plus one hour, as summer time in most of Europe: solar noon ≈ 13:06.
 */
export function sunDirection(hour: number, latDeg = BUCHAREST_LAT, declDeg = summerDeclination(latDeg), out = new THREE.Vector3()): THREE.Vector3 {
  const lat = THREE.MathUtils.clamp(latDeg, -89.999, 89.999) * DEG; // the azimuth formula is undefined right on a pole
  const dec = declDeg * DEG;
  const H = (hour - 13.1) * 15 * DEG;
  const sinEl = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const el = Math.asin(THREE.MathUtils.clamp(sinEl, -1, 1));
  // azimuth from south, positive towards the west
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat));
  const azN = az + Math.PI; // from north, clockwise (towards the east)
  return out.set(Math.sin(azN) * Math.cos(el), Math.sin(el), -Math.cos(azN) * Math.cos(el)).normalize();
}

/**
 * Sun, sky, fog and stars. The sun follows the drone: wherever it is, the sun stands where it would on
 * that place's summer solstice at the chosen time of day, so the day/night line on the globe moves with
 * the drone. The sky fades to black and the stars come out as the drone climbs into space.
 */
export class Environment {
  readonly sky = new Sky();
  readonly sun = new THREE.DirectionalLight(0xffffff, 3);
  readonly hemi = new THREE.HemisphereLight(0xbfd8ff, 0x5a5348, 1);
  readonly fog = new THREE.FogExp2(0xb4c8dc, FOG_DENSITY);
  readonly stars: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  /** Unit vector towards the sun, local coordinates. */
  readonly sunDir = new THREE.Vector3();
  /** 0 by day, 1 at night in Bucharest: drives lit windows, neon and lamps. */
  night = 0;
  private hour = 14;
  private baseDensity = FOG_DENSITY;
  /** World direction → the eye's own east/up/south frame, for the sky shader (which assumes +Y is up). */
  private skyBasis = new THREE.Matrix3();
  private q = new THREE.Quaternion();
  private m4 = new THREE.Matrix4();
  private fogDay = new THREE.Color();
  private fogNight = new THREE.Color(0x0d1320);

  constructor(scene: THREE.Scene) {
    this.sky.scale.setScalar(100000);
    this.sky.renderOrder = -1;
    this.sky.frustumCulled = false;
    const mat = this.sky.material;
    const u = mat.uniforms;
    u.turbidity.value = 2;
    u.rayleigh.value = RAYLEIGH;
    u.mieCoefficient.value = MIE;
    u.mieDirectionalG.value = 0.9;
    u.cloudCoverage.value = 0; // a cloudless day
    u.skyBasis = { value: this.skyBasis };
    const dirExpr = 'normalize( vWorldPosition - cameraPosition )';
    if (!mat.fragmentShader.includes(dirExpr)) throw new Error('Unexpected Sky shader: cannot orient it to the local up');
    // the clear-day sky is a deep, saturated blue overhead: darken and saturate the shader's output a little,
    // so the bright scene exposure doesn't wash it out to pale blue
    const outExpr = 'gl_FragColor = vec4( texColor, 1.0 );';
    if (!mat.fragmentShader.includes(outExpr)) throw new Error('Unexpected Sky shader: cannot adjust its colour');
    mat.fragmentShader = `uniform mat3 skyBasis;\n${mat.fragmentShader
      .replace(dirExpr, `skyBasis * ${dirExpr}`)
      .replace(outExpr, `vec3 skyC = texColor * ${SKY_GAIN.toFixed(3)};
			float skyL = dot( skyC, vec3( 0.2126, 0.7152, 0.0722 ) );
			gl_FragColor = vec4( max( mix( vec3( skyL ), skyC, ${SKY_SATURATION.toFixed(3)} ), 0.0 ), 1.0 );`)}`;
    scene.add(this.sky);

    this.stars = makeStars();
    scene.add(this.stars);

    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    const cam = this.sun.shadow.camera;
    cam.left = -160;
    cam.right = 160;
    cam.top = 160;
    cam.bottom = -160;
    cam.near = 1;
    cam.far = 1500;
    scene.add(this.sun, this.sun.target, this.hemi);
    scene.fog = this.fog;
  }

  setQuality(q: Quality) {
    const size = q === 'high' ? 4096 : 2048;
    if (this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  /** The chosen time of day; the sun's direction itself is worked out every frame, where the drone is. */
  setTime(hour: number) {
    this.hour = hour;
    sunDirection(hour, BUCHAREST_LAT, summerDeclination(BUCHAREST_LAT), this.sunDir);
    this.lightCity();
  }

  /** Sun and sky light on the detailed scene (and its lit windows) from the sun's height over Bucharest. */
  private lightCity() {
    const elDeg = Math.asin(THREE.MathUtils.clamp(this.sunDir.y, -1, 1)) / DEG; // +Y is Bucharest's up

    // 1 above 8°, 0 below -6°
    const day = THREE.MathUtils.smoothstep(elDeg, -6, 8);
    this.night = 1 - THREE.MathUtils.smoothstep(elDeg, -4, 6);
    const golden = 1 - THREE.MathUtils.smoothstep(elDeg, 2, 22);

    // clear-sky balance: direct sun ~7x the sky's fill on the ground, so shadows are crisp and fairly dark
    this.sun.intensity = 4 * THREE.MathUtils.smoothstep(elDeg, -1, 6);
    this.sun.color.copy(SUN_HIGH).lerp(SUN_LOW, golden);
    this.hemi.intensity = 0.2 + 0.7 * day;
    this.hemi.color.setHSL(0.59, 0.6, 0.32 + 0.3 * day);
    this.hemi.groundColor.setHSL(0.08, 0.15, 0.12 + 0.2 * day);
  }

  /**
   * Puts the sun where it would be at the eye's latitude on its summer solstice, keeps sky, stars and the
   * shadow frustum around the eye, orients the sky to the local up, and fades the air away with altitude.
   * @param aligned the eye's east/up/north frame (see Planet.alignedFrame)
   * @param latitude the eye's latitude, degrees
   */
  update(camera: THREE.Camera, altitude: number, aligned: THREE.Quaternion, latitude: number) {
    const p = camera.position;
    this.sky.position.copy(p);
    this.stars.position.copy(p);

    // the sun follows the drone: computed in the eye's own east/up/north frame, then turned into the world
    const u = this.sky.material.uniforms;
    const localSun = sunDirection(this.hour, latitude, summerDeclination(latitude), u.sunPosition.value as THREE.Vector3);
    this.sunDir.copy(localSun).applyQuaternion(aligned);
    this.lightCity();

    // the sky shader works in the eye's own frame: rotate view directions into it (the sun already is)
    const inv = this.q.copy(aligned).invert();
    this.skyBasis.setFromMatrix4(this.m4.makeRotationFromQuaternion(inv));
    const space = THREE.MathUtils.smoothstep(altitude, 15000, 90000);
    const air = Math.max(0.002, 1 - space); // never 0: the shader divides by it
    u.rayleigh.value = RAYLEIGH * air;
    u.mieCoefficient.value = MIE * air;

    // fog colour from the sun's height where the eye is
    const elDeg = Math.asin(THREE.MathUtils.clamp(localSun.y, -1, 1)) / DEG;
    const day = THREE.MathUtils.smoothstep(elDeg, -6, 8);
    const golden = 1 - THREE.MathUtils.smoothstep(elDeg, 2, 22);
    this.fogDay.set(0xb4c8dc).lerp(new THREE.Color(0xe8b98a), golden * 0.55);
    this.fog.color.copy(this.fogNight).lerp(this.fogDay, day * air);
    this.fog.density = (this.baseDensity / (1 + altitude / 250)) * air;

    const starlight = Math.max(space, 1 - THREE.MathUtils.smoothstep(elDeg, -10, -2));
    this.stars.material.color.setScalar(starlight);
    this.stars.visible = starlight > 0.01;

    // shadows only make sense near the ground; snap to a grid to avoid shimmering
    const snap = 4;
    const cx = Math.round(p.x / snap) * snap, cz = Math.round(p.z / snap) * snap;
    this.sun.position.set(cx + this.sunDir.x * 600, Math.max(30, this.sunDir.y * 600), cz + this.sunDir.z * 600);
    this.sun.target.position.set(cx, 0, cz);
    this.sun.castShadow = altitude < 900;
  }

  dispose(scene: THREE.Scene) {
    scene.remove(this.sky, this.stars, this.sun, this.sun.target, this.hemi);
    this.sky.geometry.dispose();
    this.sky.material.dispose();
    this.stars.geometry.dispose();
    this.stars.material.dispose();
    this.sun.shadow.map?.dispose();
    scene.fog = null;
  }
}

function makeStars(): THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> {
  const n = 4500;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  let s = 12345;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const z = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    pos.set([Math.cos(a) * r * 40000, z * 40000, Math.sin(a) * r * 40000], i * 3);
    const b = 0.35 + rand() ** 3 * 0.9;
    c.setHSL(0.58 + (rand() - 0.5) * 0.2, 0.3 * rand(), b);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // additive but not "transparent": it stays in the opaque pass, drawn before the globe covers it
  const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const pts = new THREE.Points(g, m);
  pts.renderOrder = -0.9;
  pts.frustumCulled = false;
  return pts;
}
