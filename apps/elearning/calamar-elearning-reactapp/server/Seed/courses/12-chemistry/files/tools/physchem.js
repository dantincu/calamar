// physchem.js: gases, reaction rates, equilibrium and electrochemistry.
//
//   node physchem.js gas P=? V=22.4 n=1 T=273.15       ideal gas law: give three of P (kPa), V (L), n (mol), T (K)
//   node physchem.js arrhenius 50 298 308              Ea (kJ/mol), T1, T2 (K): how much faster at T2
//   node physchem.js halflife 5730 1000 0.25           half-life, time (same units), or a fraction left to date
//   node physchem.js ice "N2 + 3 H2 -> 2 NH3" 1 3 0 0.05   equation, starting mol/L of each species, K
//   node physchem.js cell 0.34 -0.76 2 0.01 1          E cathode, E anode (V), electrons, [anode ion], [cathode ion]

process.on("uncaughtException", (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const R = 8.314;       // J/(mol K)
const F = 96485;       // C/mol

const [cmd, ...a] = process.argv.slice(2);

if (cmd === 'gas') {
  const v = Object.fromEntries(a.map((s) => s.split('=')).map(([k, x]) => [k, x === '?' ? null : Number(x)]));
  const Rl = 8.314;    // kPa L / (mol K): same number as J/(mol K)
  if (v.P == null) v.P = (v.n * Rl * v.T) / v.V;
  else if (v.V == null) v.V = (v.n * Rl * v.T) / v.P;
  else if (v.n == null) v.n = (v.P * v.V) / (Rl * v.T);
  else if (v.T == null) v.T = (v.P * v.V) / (v.n * Rl);
  console.log(`PV = nRT:  P = ${v.P.toFixed(2)} kPa, V = ${v.V.toFixed(3)} L, n = ${v.n.toFixed(4)} mol, T = ${v.T.toFixed(2)} K (${(v.T - 273.15).toFixed(2)} °C)`);
} else if (cmd === 'arrhenius') {
  const [Ea, T1, T2] = a.map(Number);
  const ratio = Math.exp((-(Ea * 1000) / R) * (1 / T2 - 1 / T1));
  console.log(`k(T2)/k(T1) = exp(-Ea/R (1/T2 - 1/T1)) = ${ratio.toFixed(3)}: ${ratio.toFixed(2)} times as fast at ${T2} K as at ${T1} K`);
} else if (cmd === 'halflife') {
  const [h, t, frac] = a.map(Number);
  const k = Math.LN2 / h;
  console.log(`k = ln 2 / t½ = ${k.toExponential(4)} per unit time`);
  if (Number.isFinite(t)) console.log(`after ${t}: fraction left = e^(-kt) = (1/2)^(t/t½) = ${Math.exp(-k * t).toFixed(4)}`);
  if (Number.isFinite(frac)) console.log(`fraction ${frac} left after t = ln(1/fraction) / k = ${(Math.log(1 / frac) / k).toFixed(0)}`);
} else if (cmd === 'ice') {
  // node physchem.js ice "N2 + 3 H2 -> 2 NH3" 1 3 0 0.05: equation, starting concentrations (mol/L), K
  const [lhs, rhs] = a[0].split(/->|⇌|=/).map((side) => side.split('+').map((t) => t.trim()).map((t) => {
    const m = t.match(/^(\d*)\s*(.+)$/);
    return { c: m[1] ? Number(m[1]) : 1, name: m[2] };
  }));
  const specs = [...lhs, ...rhs];
  const nums = a.slice(1).map(Number);
  const start = nums.slice(0, specs.length), K = nums[specs.length];
  if (start.length !== specs.length || !(K > 0)) throw new Error('give one starting concentration per species, then K');
  const sign = specs.map((_, i) => (i < lhs.length ? -1 : 1));
  // each concentration is start + sign * c * x; find the x where Q(x) = K (Q grows with x)
  const conc = (x) => specs.map((sp, i) => start[i] + sign[i] * sp.c * x);
  const logQ = (x) => conc(x).reduce((q, c, i) => q + sign[i] * specs[i].c * Math.log(c), 0);
  let hi = Math.min(...specs.map((sp, i) => (sign[i] < 0 ? start[i] / sp.c : Infinity)));
  let lo = -Math.min(...specs.map((sp, i) => (sign[i] > 0 ? start[i] / sp.c : Infinity)));
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (logQ(mid) < Math.log(K)) lo = mid; else hi = mid;
  }
  const x = (lo + hi) / 2;
  console.log(`K = ${K}; the reaction advances by x = ${x.toPrecision(4)} mol/L
`);
  console.log('species   start    change            equilibrium');
  specs.forEach((sp, i) => console.log(`  ${sp.name.padEnd(6)} ${start[i].toFixed(4).padStart(7)}   ${sign[i] > 0 ? '+' : '-'}${sp.c}x = ${(sign[i] * sp.c * x).toFixed(4).padStart(8)}   ${conc(x)[i].toPrecision(4).padStart(10)}`));
  console.log(`
check: Q = ${Math.exp(logQ(x)).toPrecision(4)}`);
} else if (cmd === 'cell') {
  const [Ecat, Ean, nE, anodeIon, cathodeIon] = a.map(Number);
  const E0 = Ecat - Ean;
  const Q = anodeIon / cathodeIon;
  const E = E0 - ((R * 298.15) / (nE * F)) * Math.log(Q);
  console.log(`E°cell = E°cathode - E°anode = ${Ecat} - (${Ean}) = ${E0.toFixed(3)} V`);
  console.log(`ΔG° = -nFE° = -${nE} x ${F} x ${E0.toFixed(3)} = ${((-nE * F * E0) / 1000).toFixed(1)} kJ/mol`);
  console.log(`K = exp(nFE°/RT) = ${Math.exp((nE * F * E0) / (R * 298.15)).toExponential(2)}`);
  console.log(`Nernst at 25 °C, Q = ${Q}: E = E° - (0.0592/n) log Q = ${E.toFixed(3)} V`);
} else {
  console.log('usage: node physchem.js gas|arrhenius|halflife|ice|cell ... (see the top of the file)');
}
