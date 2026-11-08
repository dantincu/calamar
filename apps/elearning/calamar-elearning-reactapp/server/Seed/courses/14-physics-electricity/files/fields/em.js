// em.js: electric and magnetic fields, capacitors, transients, induction and waves.
//
//   node em.js coulomb 1e-6 -2e-6 0.05          q1, q2 (C), distance (m): the force between two charges
//   node em.js field 0,0.03 1e-9@-0.02,0 -1e-9@0.02,0      E and V at a point, from charges q@x,y (m)
//   node em.js capacitor 0.01 0.001 1 12        plate area (m²), gap (m), relative permittivity, voltage
//   node em.js rc 10000 100e-6 9                R (Ω), C (F), V: charging a capacitor
//   node em.js rl 10 0.5 12                     R (Ω), L (H), V: current building up in an inductor
//   node em.js wire 10 0.05                     current (A), distance (m): field of a long straight wire
//   node em.js solenoid 1000 0.2 2              turns, length (m), current (A): field inside a solenoid
//   node em.js particle electron 1e6 1e-3       particle (electron/proton) or q,m; speed (m/s), B (T): circular motion
//   node em.js generator 200 0.01 0.5 50        turns, coil area (m²), B (T), frequency (Hz): peak and RMS EMF
//   node em.js wave 100e6                       frequency (Hz): wavelength and photon energy
//   node em.js light                            the speed of light from the electric and magnetic constants

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const EPS0 = 8.8541878128e-12;   // F/m
const MU0 = 1.25663706212e-6;    // N/A² (4 pi x 1e-7, to 10 digits)
const K = 1 / (4 * Math.PI * EPS0);
const E_CHARGE = 1.602176634e-19;
const H = 6.62607015e-34;
const C_LIGHT = 299792458;

const si = (x, unit) => {
  const a = Math.abs(x);
  const prefixes = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'], [1e-15, 'f']];
  if (a === 0) return `0 ${unit}`;
  const [s, p] = prefixes.find(([s]) => a >= s) ?? prefixes[prefixes.length - 1];
  return `${(x / s).toPrecision(4)} ${p}${unit}`;
};

const [cmd, ...a] = process.argv.slice(2);
const n = a.map(Number);

if (cmd === 'coulomb') {
  const [q1, q2, r] = n;
  const F = (K * q1 * q2) / (r * r);
  console.log(`F = k q1 q2 / r² = ${K.toExponential(4)} x ${q1} x ${q2} / ${r}² = ${si(F, 'N')} (${F > 0 ? 'repulsive' : 'attractive'})`);
} else if (cmd === 'field') {
  const [px, py] = a[0].split(',').map(Number);
  let Ex = 0, Ey = 0, V = 0;
  for (const s of a.slice(1)) {
    const [q, pos] = s.split('@');
    const [x, y] = pos.split(',').map(Number);
    const dx = px - x, dy = py - y, r = Math.hypot(dx, dy);
    const Eq = (K * Number(q)) / (r * r);
    Ex += (Eq * dx) / r; Ey += (Eq * dy) / r;
    V += (K * Number(q)) / r;
  }
  console.log(`at (${px}, ${py}) m:`);
  console.log(`  E = (${Ex.toExponential(3)}, ${Ey.toExponential(3)}) V/m, |E| = ${si(Math.hypot(Ex, Ey), 'V/m')}, direction ${(Math.atan2(Ey, Ex) * 180 / Math.PI).toFixed(1)}°`);
  console.log(`  V = ${si(V, 'V')}`);
} else if (cmd === 'capacitor') {
  const [A, d, er = 1, V = 0] = n;
  const Cap = (er * EPS0 * A) / d;
  console.log(`C = eps_r eps0 A / d = ${si(Cap, 'F')}`);
  if (V) {
    console.log(`at ${V} V: charge Q = CV = ${si(Cap * V, 'C')}, field E = V/d = ${si(V / d, 'V/m')}, energy ½CV² = ${si(0.5 * Cap * V * V, 'J')}`);
  }
} else if (cmd === 'rc') {
  const [R, Cap, V] = n;
  const tau = R * Cap;
  console.log(`time constant tau = RC = ${si(tau, 's')}\n`);
  console.log('     t        t/tau   V across C   current');
  for (const k of [0, 0.5, 1, 2, 3, 4, 5]) {
    const t = k * tau;
    console.log(`${si(t, 's').padStart(10)}   ${k.toFixed(1).padStart(5)}   ${si(V * (1 - Math.exp(-k)), 'V').padStart(10)}   ${si((V / R) * Math.exp(-k), 'A').padStart(10)}`);
  }
  console.log(`\nafter 5 tau the capacitor is ${(100 * (1 - Math.exp(-5))).toFixed(1)} % charged; stored energy ½CV² = ${si(0.5 * Cap * V * V, 'J')}`);
} else if (cmd === 'rl') {
  const [R, L, V] = n;
  const tau = L / R;
  console.log(`time constant tau = L/R = ${si(tau, 's')}, final current V/R = ${si(V / R, 'A')}\n`);
  for (const k of [0, 1, 2, 3, 5]) console.log(`  t = ${si(k * tau, 's').padStart(9)}: I = ${si((V / R) * (1 - Math.exp(-k)), 'A')}`);
  console.log(`\nenergy stored in the magnetic field at the end: ½LI² = ${si(0.5 * L * (V / R) ** 2, 'J')}`);
} else if (cmd === 'wire') {
  const [I, r] = n;
  const B = (MU0 * I) / (2 * Math.PI * r);
  console.log(`B = mu0 I / (2 pi r) = ${si(B, 'T')} (the Earth's field is about 50 µT: this is ${(B / 50e-6).toFixed(2)} times that)`);
} else if (cmd === 'solenoid') {
  const [N, len, I] = n;
  console.log(`B = mu0 (N/L) I = ${si(MU0 * (N / len) * I, 'T')}`);
} else if (cmd === 'particle') {
  const p = { electron: [-E_CHARGE, 9.1093837e-31], proton: [E_CHARGE, 1.67262192e-27] }[a[0]] ?? a[0].split(',').map(Number);
  const [q, m] = p;
  const [v, B] = [n[1], n[2]];
  const r = (m * v) / (Math.abs(q) * B);
  console.log(`radius r = mv / (|q|B) = ${si(r, 'm')}`);
  console.log(`cyclotron frequency f = |q|B / (2 pi m) = ${si((Math.abs(q) * B) / (2 * Math.PI * m), 'Hz')} (independent of the speed)`);
} else if (cmd === 'generator') {
  const [N, A, B, f] = n;
  const peak = N * B * A * 2 * Math.PI * f;
  console.log(`peak EMF = N B A omega = ${N} x ${B} x ${A} x 2 pi ${f} = ${si(peak, 'V')}, RMS = peak / sqrt 2 = ${si(peak / Math.SQRT2, 'V')}`);
} else if (cmd === 'wave') {
  const f = n[0];
  const E = H * f;
  console.log(`wavelength = c / f = ${si(C_LIGHT / f, 'm')}; photon energy hf = ${E.toExponential(3)} J = ${si(E / E_CHARGE, 'eV')}`);
} else if (cmd === 'light') {
  console.log(`1 / sqrt(mu0 eps0) = 1 / sqrt(${MU0.toExponential(6)} x ${EPS0.toExponential(6)}) = ${(1 / Math.sqrt(MU0 * EPS0)).toFixed(0)} m/s`);
  console.log(`measured speed of light: ${C_LIGHT} m/s (exact, by the definition of the meter)`);
} else {
  console.log('usage: node em.js coulomb|field|capacitor|rc|rl|wire|solenoid|particle|generator|wave|light ... (see the top of the file)');
}
