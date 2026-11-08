// schrodinger.js: solve the one-dimensional time-independent Schrödinger equation for an electron,
//   -(hbar²/2m) psi'' + V(x) psi = E psi,
// by finite differences, and show the lowest energy levels and their probability densities.
//
//   node schrodinger.js box 1                  infinite well, width 1 nm
//   node schrodinger.js finite 1 0.5           finite well: width 1 nm, depth 0.5 eV
//   node schrodinger.js harmonic 0.1           harmonic oscillator with hbar*omega = 0.1 eV
//   node schrodinger.js double 0.6 0.2 0.5     two wells of 0.6 nm, separated by a 0.2 nm wall, depth 0.5 eV
//   add --levels k to show k levels (default 4), --plot 0 to hide the plots
//
// Units: nm and eV. hbar²/2m for the electron is 0.0381 eV nm².

process.on('uncaughtException', (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const T0 = 0.0380998;   // hbar² / 2 m_e in eV nm²

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : def; };
const [kind, p1, p2, p3] = [args[0], Number(args[1]), Number(args[2]), Number(args[3])];
const levels = opt('--levels', 4), plot = opt('--plot', 1);

// The potential on a grid. Outside the region the wave function is zero (infinite walls).
let span, V, analytic = null, note = '';
if (kind === 'box') {
  span = p1; V = () => 0;
  analytic = (n) => (T0 * Math.PI ** 2 * (n + 1) ** 2) / (p1 * p1);
  note = `infinite well of width ${p1} nm; exact E_n = n² pi² hbar²/(2 m L²)`;
} else if (kind === 'finite') {
  span = p1 * 8; V = (x) => (Math.abs(x - span / 2) < p1 / 2 ? 0 : p2);
  note = `finite well: width ${p1} nm, depth ${p2} eV (levels above ${p2} eV are not bound)`;
} else if (kind === 'harmonic') {
  // V = ½ m omega² x² = (hbar omega)² x² / (4 T0)
  const hw = p1; span = 12 * Math.sqrt(T0 / hw);
  V = (x) => (hw * hw * (x - span / 2) ** 2) / (4 * T0);
  analytic = (n) => (n + 0.5) * hw;
  note = `harmonic oscillator, hbar omega = ${hw} eV; exact E_n = (n + ½) hbar omega`;
} else if (kind === 'double') {
  const [w, gap, depth] = [p1, p2, p3];
  span = 2 * w + gap + 2 * w;
  V = (x) => { const d = Math.abs(x - span / 2); return d > gap / 2 && d < gap / 2 + w ? 0 : depth; };
  note = `double well: two wells of ${w} nm, a ${gap} nm wall between them, depth ${depth} eV`;
} else {
  console.log('usage: node schrodinger.js box|finite|harmonic|double ... (see the top of the file)');
  process.exit(0);
}

const N = 4000;                       // interior grid points
const dx = span / (N + 1);
const x = Array.from({ length: N }, (_, i) => (i + 1) * dx);
const t = T0 / (dx * dx);
const diag = x.map((xi) => 2 * t + V(xi));
const off = -t;

// Number of eigenvalues below E (Sturm sequence count for a symmetric tridiagonal matrix).
function countBelow(E) {
  let count = 0, q = diag[0] - E;
  if (q < 0) count++;
  for (let i = 1; i < N; i++) {
    q = diag[i] - E - (off * off) / (q === 0 ? 1e-300 : q);
    if (q < 0) count++;
  }
  return count;
}
function eigenvalue(k) {   // the k-th smallest (k = 0, 1, ...), by bisection
  let lo = Math.min(...diag) - 4 * t, hi = Math.max(...diag) + 4 * t;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (countBelow(mid) > k) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}
// Eigenvector by inverse iteration: solve (H - E) y = y_old with the Thomas algorithm.
function eigenvector(E) {
  let y = x.map(() => 1);
  const shift = E + 1e-9 * Math.max(1, Math.abs(E));
  for (let it = 0; it < 4; it++) {
    const c = Array(N), d = Array(N);
    let b0 = diag[0] - shift;
    c[0] = off / b0; d[0] = y[0] / b0;
    for (let i = 1; i < N; i++) {
      const m = diag[i] - shift - off * c[i - 1];
      c[i] = off / m; d[i] = (y[i] - off * d[i - 1]) / m;
    }
    const z = Array(N);
    z[N - 1] = d[N - 1];
    for (let i = N - 2; i >= 0; i--) z[i] = d[i] - c[i] * z[i + 1];
    const norm = Math.sqrt(z.reduce((s, v) => s + v * v, 0) * dx);
    y = z.map((v) => v / norm);
  }
  return y;
}

console.log(note);
console.log(`grid: ${N} points, spacing ${(dx * 1000).toFixed(2)} pm\n`);
console.log(analytic ? 'level   energy (eV)   exact (eV)' : 'level   energy (eV)');
const found = [];
for (let k = 0; k < levels; k++) {
  const E = eigenvalue(k);
  if (kind === 'finite' && E >= p2) { console.log(`  n = ${k + 1}: none (no more bound states below ${p2} eV)`); break; }
  found.push(E);
  console.log(`  n = ${k + 1}   ${E.toFixed(5).padStart(10)}` + (analytic ? `   ${analytic(k).toFixed(5).padStart(10)}` : ''));
}
if (kind === 'double' && found.length >= 2) {
  console.log(`\nsplitting of the two lowest levels: ${((found[1] - found[0]) * 1000).toFixed(2)} meV; an electron put in one well tunnels to the other and back with period h / dE = ${(4.135667696e-15 / (found[1] - found[0]) * 1e15).toFixed(1)} fs`);
}

if (plot) {
  const cols = 64;
  for (let k = 0; k < Math.min(found.length, 3); k++) {
    const psi = eigenvector(found[k]);
    const prob = psi.map((v) => v * v);
    const bins = Array.from({ length: cols }, (_, j) => {
      const from = Math.floor((j * N) / cols), to = Math.floor(((j + 1) * N) / cols);
      return prob.slice(from, to).reduce((s, v) => s + v, 0) / (to - from);
    });
    const max = Math.max(...bins);
    const rows = 5;
    console.log(`\n|psi|² of level ${k + 1} (x from 0 to ${span.toFixed(2)} nm)`);
    for (let r = rows; r >= 1; r--) console.log('  |' + bins.map((b) => (b / max >= (r - 0.5) / rows ? '#' : ' ')).join(''));
    console.log('  +' + '-'.repeat(cols));
    console.log('   ' + Array.from({ length: cols }, (_, j) => (V(((j + 0.5) * span) / cols) > (found[k] ?? 0) ? '^' : ' ')).join('') + '   (^ = classically forbidden)');
  }
}
