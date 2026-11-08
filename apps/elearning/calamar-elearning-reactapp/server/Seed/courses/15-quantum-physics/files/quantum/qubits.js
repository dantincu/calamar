// qubits.js: a small quantum computer simulator (state vectors), plus Bell's inequality and Grover's search.
//
//   node qubits.js run 1 "H 0"                         a circuit on 1 qubit: show the amplitudes
//   node qubits.js run 2 "H 0; CNOT 0 1"               a Bell state
//   node qubits.js run 2 "H 0; CNOT 0 1" --shots 1000  also measure it 1000 times (seeded, repeatable)
//   node qubits.js run 3 "..." --qubit 2               also the probabilities of one qubit on its own
//   node qubits.js chsh                                the CHSH test: quantum 2.83 vs the classical limit 2
//   node qubits.js grover 3 5                          Grover search for item 5 among 2^3 = 8
//
// Gates: H, X, Y, Z, S, T, RY <angle in degrees> (one qubit), CNOT c t, CZ c t, SWAP a b.
// Qubit 0 is the rightmost bit when a basis state is written as |q(n-1) ... q1 q0>.

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

// complex numbers as [re, im]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const abs2 = (a) => a[0] * a[0] + a[1] * a[1];
const R = Math.SQRT1_2;

const GATES = {
  H: [[[R, 0], [R, 0]], [[R, 0], [-R, 0]]],
  X: [[[0, 0], [1, 0]], [[1, 0], [0, 0]]],
  Y: [[[0, 0], [0, -1]], [[0, 1], [0, 0]]],
  Z: [[[1, 0], [0, 0]], [[0, 0], [-1, 0]]],
  S: [[[1, 0], [0, 0]], [[0, 0], [0, 1]]],
  T: [[[1, 0], [0, 0]], [[0, 0], [R, R]]],
};
const ry = (deg) => {
  const th = (deg * Math.PI) / 180;
  return [[[Math.cos(th / 2), 0], [-Math.sin(th / 2), 0]], [[Math.sin(th / 2), 0], [Math.cos(th / 2), 0]]];
};

function newState(n) {
  const s = Array.from({ length: 2 ** n }, () => [0, 0]);
  s[0] = [1, 0];
  return s;
}
function apply1(s, U, q) {
  const out = s.map((a) => [...a]);
  const bit = 1 << q;
  for (let i = 0; i < s.length; i++) {
    if (i & bit) continue;
    const a0 = s[i], a1 = s[i | bit];
    out[i] = add(mul(U[0][0], a0), mul(U[0][1], a1));
    out[i | bit] = add(mul(U[1][0], a0), mul(U[1][1], a1));
  }
  return out;
}
function cnot(s, c, t) {
  const out = s.map((a) => [...a]);
  for (let i = 0; i < s.length; i++) if ((i >> c) & 1) out[i] = s[i ^ (1 << t)];
  return out;
}
function cz(s, c, t) {
  return s.map((a, i) => (((i >> c) & 1) && ((i >> t) & 1) ? [-a[0], -a[1]] : a));
}
function swap(s, p, q) {
  return s.map((_, i) => {
    const bp = (i >> p) & 1, bq = (i >> q) & 1;
    const j = bp === bq ? i : i ^ (1 << p) ^ (1 << q);
    return s[j];
  });
}

function run(n, program) {
  let s = newState(n);
  for (const stmt of program.split(';').map((x) => x.trim()).filter(Boolean)) {
    const [g, ...rest] = stmt.split(/\s+/);
    const q = rest.map(Number);
    const G = g.toUpperCase();
    if (q.some((v) => !(v >= 0 && v < n)) && G !== 'RY') throw new Error(`bad qubit in "${stmt}" (qubits are 0 to ${n - 1})`);
    if (GATES[G]) s = apply1(s, GATES[G], q[0]);
    else if (G === 'RY') s = apply1(s, ry(q[0]), q[1]);
    else if (G === 'CNOT' || G === 'CX') s = cnot(s, q[0], q[1]);
    else if (G === 'CZ') s = cz(s, q[0], q[1]);
    else if (G === 'SWAP') s = swap(s, q[0], q[1]);
    else throw new Error(`unknown gate "${g}"`);
  }
  return s;
}

const ket = (i, n) => `|${i.toString(2).padStart(n, '0')}>`;
const fmtC = ([re, im]) => {
  const r = Math.abs(re) < 1e-12 ? 0 : re, m = Math.abs(im) < 1e-12 ? 0 : im;
  if (m === 0) return r.toFixed(4).padStart(8);
  if (r === 0) return `${m.toFixed(4)}i`.padStart(8);
  return `${r.toFixed(4)}${m >= 0 ? '+' : '-'}${Math.abs(m).toFixed(4)}i`;
};

function rng(seed) {   // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'run') {
  const n = Number(args[0]);
  const s = run(n, args[1] ?? '');
  console.log(`${n} qubit(s), circuit: ${args[1]}\n`);
  console.log('basis    amplitude   probability');
  s.forEach((a, i) => { if (abs2(a) > 1e-12) console.log(`${ket(i, n).padEnd(8)} ${fmtC(a).padStart(10)}   ${abs2(a).toFixed(4)}`); });
  const mi = args.indexOf('--qubit');
  if (mi >= 0) {
    const q = Number(args[mi + 1]);
    const p1 = s.reduce((sum, a, i) => sum + ((i >> q) & 1 ? abs2(a) : 0), 0);
    console.log(`
qubit ${q} alone: P(0) = ${Math.abs(1 - p1).toFixed(4)}, P(1) = ${p1.toFixed(4)}`);
  }
  const k = args.indexOf('--shots');
  if (k >= 0) {
    const shots = Number(args[k + 1]);
    const rand = rng(Number(args[args.indexOf('--seed') + 1]) || 7);
    const counts = new Map();
    for (let t = 0; t < shots; t++) {
      let r = rand(), i = 0;
      while (i < s.length - 1 && r >= abs2(s[i])) { r -= abs2(s[i]); i++; }
      counts.set(i, (counts.get(i) ?? 0) + 1);
    }
    console.log(`\n${shots} measurements:`);
    for (const [i, c] of [...counts].sort((x, y) => x[0] - y[0])) console.log(`  ${ket(i, n)}  ${String(c).padStart(5)}  ${'#'.repeat(Math.round((40 * c) / shots))}`);
  }
} else if (cmd === 'chsh') {
  // Bell state (|00> + |11>)/sqrt 2. Alice measures along angle a, Bob along b (in the x-z plane,
  // as for photon polarizers at half these angles). The correlation is E(a, b) = cos(a - b).
  const corr = (a, b) => {
    // rotate each qubit so that measuring along the angle becomes a measurement in the 0/1 basis
    let s = run(2, 'H 0; CNOT 0 1');
    s = apply1(s, ry(-a), 0);
    s = apply1(s, ry(-b), 1);
    return s.reduce((sum, amp, i) => sum + abs2(amp) * (((i & 1) ^ ((i >> 1) & 1)) ? -1 : 1), 0);
  };
  const [a0, a1, b0, b1] = [0, 90, 45, -45];
  const E = [[corr(a0, b0), corr(a0, b1)], [corr(a1, b0), corr(a1, b1)]];
  console.log(`Alice measures at ${a0}° or ${a1}°, Bob at ${b0}° or ${b1}°, on the Bell state (|00> + |11>)/sqrt 2\n`);
  console.log(`E(a, b)   = ${E[0][0].toFixed(4)}`);
  console.log(`E(a, b')  = ${E[0][1].toFixed(4)}`);
  console.log(`E(a', b)  = ${E[1][0].toFixed(4)}`);
  console.log(`E(a', b') = ${E[1][1].toFixed(4)}`);
  const S = E[0][0] + E[0][1] + E[1][0] - E[1][1];
  console.log(`\nS = E(a,b) + E(a,b') + E(a',b) - E(a',b') = ${S.toFixed(4)}   (2 sqrt 2 = ${(2 * Math.SQRT2).toFixed(4)})`);
  // the best that any local hidden-variable strategy can do: try all deterministic answers
  let best = 0;
  for (let m = 0; m < 16; m++) {
    const A = [m & 1 ? 1 : -1, m & 2 ? 1 : -1], B = [m & 4 ? 1 : -1, m & 8 ? 1 : -1];
    best = Math.max(best, Math.abs(A[0] * B[0] + A[0] * B[1] + A[1] * B[0] - A[1] * B[1]));
  }
  console.log(`best local hidden-variable value, over all 16 deterministic strategies: ${best}`);
  console.log(S > best ? 'quantum mechanics violates the classical bound: no local hidden-variable theory can explain it' : '');
} else if (cmd === 'grover') {
  const n = Number(args[0]), target = Number(args[1]);
  const Nn = 2 ** n;
  const iterations = Math.floor((Math.PI / 4) * Math.sqrt(Nn));
  let s = newState(n);
  for (let q = 0; q < n; q++) s = apply1(s, GATES.H, q);
  console.log(`Grover search for item ${target} (${ket(target, n)}) among ${Nn}: optimal number of iterations floor(pi/4 sqrt N) = ${iterations}\n`);
  console.log('iteration   probability of the target');
  console.log(`    0       ${abs2(s[target]).toFixed(4)}`);
  for (let k = 1; k <= iterations + 2; k++) {
    s = s.map((a, i) => (i === target ? [-a[0], -a[1]] : a));            // oracle: flip the target's sign
    const mean = s.reduce((m, a) => add(m, a), [0, 0]).map((v) => v / Nn);
    s = s.map((a) => [2 * mean[0] - a[0], 2 * mean[1] - a[1]]);          // diffusion: reflect about the mean
    console.log(`    ${k}       ${abs2(s[target]).toFixed(4)}${k === iterations ? '   <- stop here' : ''}`);
  }
  console.log(`\na classical search needs on average about N/2 = ${Nn / 2} looks; Grover needs about sqrt N`);
} else {
  console.log('usage: node qubits.js run|chsh|grover ... (see the top of the file)');
}
