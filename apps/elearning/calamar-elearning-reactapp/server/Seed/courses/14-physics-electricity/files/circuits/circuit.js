// circuit.js: a small circuit simulator using modified nodal analysis (the method inside SPICE).
//
//   node circuit.js divider.json                       DC: node voltages, currents and powers
//   node circuit.js rlc.json --ac 1591.5               AC at one frequency (Hz): amplitudes and phases
//   node circuit.js rlc.json --sweep 100 100000 out [points]   sweep the frequency (log scale), probing a node voltage
//
// A netlist is a JSON file: { "title": ..., "elements": [ { "type", "name", "nodes": [a, b], "value" } ] }
//   R  resistor (ohm)          C  capacitor (farad)          L  inductor (henry)
//   V  voltage source (volt): nodes[0] is the + terminal
//   I  current source (ampere): drives current from nodes[0] to nodes[1] through the source
// Node "0" is ground. In DC, capacitors are open circuits and inductors are short circuits.

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const fs = require('fs');

// ---- complex numbers as [re, im]
const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  abs: (a) => Math.hypot(a[0], a[1]),
  arg: (a) => (Math.atan2(a[1], a[0]) * 180) / Math.PI,
};

// Solve A x = b (complex) by Gaussian elimination with partial pivoting.
function solve(A, b) {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (C.abs(A[r][c]) > C.abs(A[p][c])) p = r;
    if (C.abs(A[p][c]) < 1e-15) throw new Error('the circuit has no unique solution: is a node floating, or are two voltage sources in parallel?');
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r++) {
      const f = C.div(A[r][c], A[c][c]);
      for (let k = c; k < n; k++) A[r][k] = C.sub(A[r][k], C.mul(f, A[c][k]));
      b[r] = C.sub(b[r], C.mul(f, b[c]));
    }
  }
  const x = Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s = C.sub(s, C.mul(A[r][k], x[k]));
    x[r] = C.div(s, A[r][r]);
  }
  return x;
}

// Build and solve the MNA system at angular frequency w (0 = DC).
function analyze(net, w) {
  const nodes = [...new Set(net.elements.flatMap((e) => e.nodes.map(String)))].filter((n) => n !== '0').sort();
  const idx = (n) => (String(n) === '0' ? -1 : nodes.indexOf(String(n)));
  // elements that need a current unknown: voltage sources, and inductors at DC (as 0 V sources)
  const branches = net.elements.filter((e) => e.type === 'V' || (e.type === 'L' && w === 0));
  const N = nodes.length + branches.length;
  const A = Array.from({ length: N }, () => Array.from({ length: N }, () => [0, 0]));
  const z = Array.from({ length: N }, () => [0, 0]);
  const stamp = (i, j, y) => { if (i >= 0 && j >= 0) A[i][j] = C.add(A[i][j], y); };
  const admittance = (e) => {
    if (e.type === 'R') return [1 / e.value, 0];
    if (e.type === 'C') return [0, w * e.value];
    if (e.type === 'L') return C.div([1, 0], [0, w * e.value]);
    return null;
  };
  for (const e of net.elements) {
    const [a, b] = e.nodes.map(idx);
    if (e.type === 'R' || e.type === 'C' || (e.type === 'L' && w > 0)) {
      if (e.type === 'C' && w === 0) continue;   // open circuit at DC
      const y = admittance(e);
      stamp(a, a, y); stamp(b, b, y); stamp(a, b, [-y[0], -y[1]]); stamp(b, a, [-y[0], -y[1]]);
    } else if (e.type === 'I') {
      if (a >= 0) z[a] = C.sub(z[a], [e.value, 0]);
      if (b >= 0) z[b] = C.add(z[b], [e.value, 0]);
    } else if (e.type === 'V' || e.type === 'L') {
      const k = nodes.length + branches.indexOf(e);
      if (a >= 0) { A[a][k] = C.add(A[a][k], [1, 0]); A[k][a] = C.add(A[k][a], [1, 0]); }
      if (b >= 0) { A[b][k] = C.sub(A[b][k], [1, 0]); A[k][b] = C.sub(A[k][b], [1, 0]); }
      z[k] = [e.type === 'V' ? e.value : 0, 0];
    } else {
      throw new Error(`unknown element type "${e.type}" in ${e.name}`);
    }
  }
  const x = solve(A, z);
  const V = (n) => (idx(n) < 0 ? [0, 0] : x[idx(n)]);
  const current = (e) => {   // current from nodes[0] to nodes[1] through the element
    if (e.type === 'V' || (e.type === 'L' && w === 0)) {
      return x[nodes.length + branches.indexOf(e)];   // the MNA unknown: current from nodes[0] to nodes[1] through it
    }
    if (e.type === 'I') return [e.value, 0];
    if (e.type === 'C' && w === 0) return [0, 0];
    return C.mul(admittance(e), C.sub(V(e.nodes[0]), V(e.nodes[1])));
  };
  return { nodes, V, current };
}

const fmt = (x, unit) => {
  const a = Math.abs(x);
  if (a === 0) return `0 ${unit}`;
  const [s, p] = a >= 1e3 ? [1e-3, 'k'] : a >= 1 ? [1, ''] : a >= 1e-3 ? [1e3, 'm'] : a >= 1e-6 ? [1e6, 'µ'] : [1e9, 'n'];
  return `${(x * s).toFixed(3)} ${p}${unit}`;
};

const args = process.argv.slice(2);
if (!args[0]) {
  console.log('usage: node circuit.js netlist.json [--ac f | --sweep fmin fmax node]');
  process.exit(0);
}
const net = JSON.parse(fs.readFileSync(args[0], 'utf8'));
console.log(net.title ?? args[0]);

if (args[1] === '--ac') {
  const f = Number(args[2]), w = 2 * Math.PI * f;
  const r = analyze(net, w);
  console.log(`AC analysis at f = ${f} Hz (omega = ${w.toFixed(1)} rad/s); amplitudes and phases\n`);
  for (const n of r.nodes) console.log(`  V(${n}) = ${fmt(C.abs(r.V(n)), 'V').padStart(11)}  at ${C.arg(r.V(n)).toFixed(1).padStart(6)}°`);
  console.log('');
  for (const e of net.elements) {
    const i = r.current(e);
    console.log(`  ${e.name.padEnd(4)} current ${fmt(C.abs(i), 'A').padStart(11)} at ${C.arg(i).toFixed(1).padStart(6)}°`);
  }
} else if (args[1] === '--sweep') {
  const [fmin, fmax] = [Number(args[2]), Number(args[3])];
  const probe = args[4];
  console.log(`frequency sweep, probing V(${probe}) relative to the source amplitude\n`);
  console.log('   frequency        |V|      gain (dB)   phase');
  const src = net.elements.find((e) => e.type === 'V');
  const steps = Number(args[5]) || 24;
  let peak = [0, 0];
  for (let i = 0; i <= steps; i++) {
    const f = fmin * (fmax / fmin) ** (i / steps);
    const v = analyze(net, 2 * Math.PI * f).V(probe);
    const g = C.abs(v) / Math.abs(src.value);
    if (g > peak[1]) peak = [f, g];
    console.log(`${f.toFixed(1).padStart(12)} Hz  ${C.abs(v).toFixed(4).padStart(8)}  ${(20 * Math.log10(g)).toFixed(1).padStart(8)}   ${C.arg(v).toFixed(1).padStart(6)}°`);
  }
  console.log(`\nlargest response in this sweep: ${peak[1].toFixed(3)} of the source at about ${peak[0].toFixed(0)} Hz`);
} else {
  const r = analyze(net, 0);
  console.log('DC analysis\n');
  for (const n of r.nodes) console.log(`  V(${n}) = ${fmt(r.V(n)[0], 'V')}`);
  console.log('\n  element   current       voltage       power');
  console.log('  (current from the element\'s first node to its second; a source that delivers power carries a negative current)\n');
  let delivered = 0, absorbed = 0;
  for (const e of net.elements) {
    const i = r.current(e)[0];
    const v = r.V(e.nodes[0])[0] - r.V(e.nodes[1])[0];
    // power absorbed: positive for loads, negative for a source that delivers energy
    const pAbs = v * i;
    if (pAbs < 0) delivered -= pAbs; else absorbed += pAbs;
    console.log(`  ${e.name.padEnd(8)} ${fmt(i, 'A').padStart(11)}   ${fmt(v, 'V').padStart(11)}   ${fmt(Math.abs(pAbs), 'W').padStart(10)} ${pAbs < 0 ? 'delivered' : 'absorbed'}`);
  }
  console.log(`\n  power delivered by sources ${fmt(delivered, 'W')}, absorbed ${fmt(absorbed, 'W')}`);
}
