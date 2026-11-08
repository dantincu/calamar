// motion.js: projectiles (with and without air drag), pendulums, damped springs, rockets,
// and a comparison of numerical integrators on an orbit.
//
//   node motion.js projectile 30 45                     speed (m/s), angle (degrees), no drag
//   node motion.js projectile 40 45 --drag baseball     with quadratic air drag (baseball, football, golf, or --k value)
//   node motion.js best-angle 40 --drag baseball        the angle with the longest range
//   node motion.js pendulum 1 30                        length (m), amplitude (degrees): exact vs small-angle period
//   node motion.js spring 0.5 20 0.1 0.4                mass (kg), k (N/m), x0 (m), damping b (kg/s)
//   node motion.js rocket 4400 0.9                      exhaust speed (m/s), propellant fraction of the mass
//   node motion.js integrators 0.05 10                  time step, orbits: Euler vs semi-implicit Euler vs Verlet vs RK4

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const g = 9.81;
const RHO = 1.2;   // air density, kg/m^3, at about 20 °C at sea level

// Drag constant k = rho Cd A / (2 m), so that the drag deceleration is k v^2.
const BALLS = {
  baseball: { m: 0.145, d: 0.074, Cd: 0.35 },
  football: { m: 0.43, d: 0.22, Cd: 0.25 },
  golf: { m: 0.0459, d: 0.0427, Cd: 0.25 },
};
function dragConstant(args) {
  const i = args.indexOf('--drag');
  if (i >= 0) {
    const b = BALLS[args[i + 1]];
    if (!b) throw new Error(`unknown ball "${args[i + 1]}": use ${Object.keys(BALLS).join(', ')}`);
    return (RHO * b.Cd * Math.PI * (b.d / 2) ** 2) / (2 * b.m);
  }
  const j = args.indexOf('--k');
  return j >= 0 ? Number(args[j + 1]) : 0;
}

// Fourth-order Runge-Kutta step for a state vector s with derivative f(s).
function rk4(f, s, h) {
  const k1 = f(s);
  const k2 = f(s.map((v, i) => v + (h / 2) * k1[i]));
  const k3 = f(s.map((v, i) => v + (h / 2) * k2[i]));
  const k4 = f(s.map((v, i) => v + h * k3[i]));
  return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

function fly(v0, angleDeg, k) {
  const a = (angleDeg * Math.PI) / 180;
  let s = [0, 0, v0 * Math.cos(a), v0 * Math.sin(a)];   // x, y, vx, vy
  const f = ([, , vx, vy]) => {
    const v = Math.hypot(vx, vy);
    return [vx, vy, -k * v * vx, -g - k * v * vy];
  };
  const h = 0.0005;
  let t = 0, top = 0;
  for (;;) {
    const next = rk4(f, s, h);
    top = Math.max(top, next[1]);
    if (next[1] < 0) {
      const frac = s[1] / (s[1] - next[1]);   // interpolate the landing point
      return { range: s[0] + frac * (next[0] - s[0]), height: top, time: t + frac * h, impact: Math.hypot(s[2], s[3]) };
    }
    s = next; t += h;
  }
}

const [cmd, ...args] = process.argv.slice(2);
const n = args.map(Number);

if (cmd === 'projectile') {
  const [v0, deg] = n;
  const a = (deg * Math.PI) / 180;
  console.log(`launch at ${v0} m/s, ${deg}°, g = ${g} m/s²\n`);
  console.log('                  range      max height   flight time   landing speed');
  const R = (v0 * v0 * Math.sin(2 * a)) / g, H = (v0 * Math.sin(a)) ** 2 / (2 * g), T = (2 * v0 * Math.sin(a)) / g;
  console.log(`no drag (exact)   ${R.toFixed(1).padStart(6)} m   ${H.toFixed(1).padStart(8)} m   ${T.toFixed(2).padStart(9)} s   ${v0.toFixed(1).padStart(9)} m/s`);
  const k = dragConstant(args);
  if (k > 0) {
    const r = fly(v0, deg, k);
    console.log(`with drag         ${r.range.toFixed(1).padStart(6)} m   ${r.height.toFixed(1).padStart(8)} m   ${r.time.toFixed(2).padStart(9)} s   ${r.impact.toFixed(1).padStart(9)} m/s`);
    console.log(`\ndrag constant k = rho Cd A / 2m = ${k.toFixed(5)} per m; terminal speed sqrt(g/k) = ${Math.sqrt(g / k).toFixed(1)} m/s`);
  }
} else if (cmd === 'best-angle') {
  const v0 = n[0], k = dragConstant(args);
  console.log(`launch speed ${v0} m/s, drag constant ${k.toFixed(5)} per m\n`);
  console.log('angle   range');
  let best = [0, 0];
  for (let deg = 20; deg <= 60; deg += 5) {
    const r = fly(v0, deg, k).range;
    console.log(`${String(deg).padStart(4)}°  ${r.toFixed(1).padStart(6)} m`);
  }
  for (let deg = 20; deg <= 60; deg += 0.5) {
    const r = fly(v0, deg, k).range;
    if (r > best[1]) best = [deg, r];
  }
  console.log(`\nlongest range: ${best[1].toFixed(1)} m at about ${best[0]}°`);
} else if (cmd === 'pendulum') {
  const [L, amp] = n;
  const T0 = 2 * Math.PI * Math.sqrt(L / g);
  // exact period: T = T0 / AGM(1, cos(amplitude/2))
  const agm = (x, y) => { for (let i = 0; i < 30; i++) [x, y] = [(x + y) / 2, Math.sqrt(x * y)]; return x; };
  console.log(`L = ${L} m: small-angle period T0 = 2 pi sqrt(L/g) = ${T0.toFixed(4)} s\n`);
  console.log('amplitude   exact period   longer than T0 by');
  for (const d of [5, 10, 20, 30, 45, 60, 90, 120, 170]) {
    const T = T0 / agm(1, Math.cos((d * Math.PI) / 360));
    console.log(`${String(d).padStart(6)}°     ${T.toFixed(4).padStart(8)} s     ${(100 * (T / T0 - 1)).toFixed(2).padStart(6)} %`);
  }
  // check one amplitude by simulation: time between two successive turning points
  const th0 = (amp * Math.PI) / 180;
  let s = [th0, 0], t = 0;
  const f = ([th, w]) => [w, -(g / L) * Math.sin(th)];
  const h = 1e-4;
  let lastW = 0, crossings = 0, tStart = 0;
  while (crossings < 3) {
    s = rk4(f, s, h); t += h;
    if (lastW !== 0 && Math.sign(s[1]) !== Math.sign(lastW)) {
      crossings++;
      if (crossings === 1) tStart = t;
    }
    lastW = s[1];
  }
  console.log(`\nsimulated at ${amp}°: period ${(t - tStart).toFixed(4)} s`);
} else if (cmd === 'spring') {
  const [m, k, x0, b = 0] = n;
  const w0 = Math.sqrt(k / m), zeta = b / (2 * Math.sqrt(m * k));
  console.log(`m = ${m} kg, k = ${k} N/m, b = ${b} kg/s`);
  console.log(`natural frequency w0 = sqrt(k/m) = ${w0.toFixed(3)} rad/s, period ${(2 * Math.PI / w0).toFixed(3)} s; damping ratio zeta = ${zeta.toFixed(3)} ${zeta < 1 ? '(underdamped)' : zeta === 1 ? '(critically damped)' : '(overdamped)'}\n`);
  let s = [x0, 0];
  const f = ([x, v]) => [v, (-k * x - b * v) / m];
  const h = 1e-4, Tp = (2 * Math.PI) / w0;
  console.log('    t (s)    x (m)    energy (J)');
  for (let i = 0, t = 0; i <= 8; i++) {
    const E = 0.5 * m * s[1] ** 2 + 0.5 * k * s[0] ** 2;
    console.log(`${t.toFixed(3).padStart(9)}  ${s[0].toFixed(4).padStart(7)}  ${E.toFixed(5).padStart(10)}`);
    const target = (i + 1) * Tp;
    while (t < target - h / 2) { s = rk4(f, s, h); t += h; }
  }
  if (zeta > 0 && zeta < 1) console.log(`\namplitude decays as e^(-b t / 2m): halves every ${((2 * m * Math.LN2) / b).toFixed(2)} s; quality factor Q = 1/(2 zeta) = ${(1 / (2 * zeta)).toFixed(1)}`);
} else if (cmd === 'rocket') {
  const [ve, frac] = n;
  console.log(`delta-v = ve ln(m0/mf) = ${ve} x ln(1/${(1 - frac).toFixed(2)}) = ${(ve * Math.log(1 / (1 - frac))).toFixed(0)} m/s`);
} else if (cmd === 'integrators') {
  // A circular orbit with GM = 1, r = 1, v = 1: period 2 pi, energy -1/2.
  const [h, orbits] = [n[0] || 0.05, n[1] || 10];
  const acc = (x, y) => { const r3 = Math.hypot(x, y) ** 3; return [-x / r3, -y / r3]; };
  const energy = ([x, y, vx, vy]) => 0.5 * (vx * vx + vy * vy) - 1 / Math.hypot(x, y);
  const steps = Math.round((orbits * 2 * Math.PI) / h);
  const methods = {
    'Euler': (s) => { const [ax, ay] = acc(s[0], s[1]); return [s[0] + h * s[2], s[1] + h * s[3], s[2] + h * ax, s[3] + h * ay]; },
    'semi-implicit Euler': (s) => { const [ax, ay] = acc(s[0], s[1]); const vx = s[2] + h * ax, vy = s[3] + h * ay; return [s[0] + h * vx, s[1] + h * vy, vx, vy]; },
    'velocity Verlet': (s) => {
      const [ax, ay] = acc(s[0], s[1]);
      const x = s[0] + h * s[2] + 0.5 * h * h * ax, y = s[1] + h * s[3] + 0.5 * h * h * ay;
      const [bx, by] = acc(x, y);
      return [x, y, s[2] + 0.5 * h * (ax + bx), s[3] + 0.5 * h * (ay + by)];
    },
    'RK4': (s) => rk4(([x, y, vx, vy]) => [vx, vy, ...acc(x, y)], s, h),
  };
  console.log(`circular orbit, GM = 1, r = 1: ${orbits} orbits with time step ${h} (${steps} steps)\n`);
  console.log('method                 radius at end   relative energy error   force evaluations');
  for (const [name, step] of Object.entries(methods)) {
    let s = [1, 0, 0, 1];
    for (let i = 0; i < steps; i++) s = step(s);
    const evals = { 'RK4': 4, 'velocity Verlet': 1 }[name] ?? 1;
    console.log(`${name.padEnd(22)} ${Math.hypot(s[0], s[1]).toFixed(5).padStart(12)}   ${((energy(s) + 0.5) / 0.5).toExponential(2).padStart(13)}        ${(steps * evals).toString().padStart(10)}`);
  }
} else {
  console.log('usage: node motion.js projectile|best-angle|pendulum|spring|rocket|integrators ... (see the top of the file)');
}
