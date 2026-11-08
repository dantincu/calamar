// balance.js: balance chemical equations, and compute amounts, the limiting reagent and the yield.
//
//   node balance.js "C3H8 + O2 -> CO2 + H2O"
//   node balance.js "Fe2O3 + CO -> Fe + CO2" --have Fe2O3=1000            grams of everything from 1 kg of ore
//   node balance.js "N2 + H2 -> NH3" --have N2=28 H2=10                   limiting reagent and theoretical yield
//   node balance.js "N2 + H2 -> NH3" --have N2=28 H2=10 --actual NH3=20   percent yield
//
// Balancing is linear algebra: one equation per element, one unknown per coefficient. The script finds the
// smallest whole-number solution with exact fractions.

process.on("uncaughtException", (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const { parseFormula, molarMass } = require('./elements');

// ---- exact fractions with BigInt
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const frac = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
const sub = ([a, b], [c, d]) => frac(a * d - c * b, b * d);
const mul = ([a, b], [c, d]) => frac(a * c, b * d);
const div = ([a, b], [c, d]) => frac(a * d, b * c);
const isZero = ([a]) => a === 0n;

function balance(equation) {
  const [lhs, rhs] = equation.split(/->|=>|=|→/).map((side) => side.split('+').map((s) => s.trim()).filter(Boolean));
  if (!rhs) throw new Error('write the equation as "A + B -> C + D"');
  const species = [...lhs, ...rhs];
  const counts = species.map(parseFormula);
  const elements = [...new Set(counts.flatMap(Object.keys))];
  // matrix: rows = elements, columns = species; products count negatively
  let m = elements.map((el) => species.map((_, j) => frac(BigInt((counts[j][el] ?? 0) * (j < lhs.length ? 1 : -1)))));
  // reduced row echelon form
  const cols = species.length;
  let row = 0;
  const pivots = [];
  for (let c = 0; c < cols && row < m.length; c++) {
    const p = m.findIndex((r, i) => i >= row && !isZero(r[c]));
    if (p < 0) continue;
    [m[row], m[p]] = [m[p], m[row]];
    const pv = m[row][c];
    m[row] = m[row].map((x) => div(x, pv));
    for (let i = 0; i < m.length; i++) {
      if (i !== row && !isZero(m[i][c])) {
        const f = m[i][c];
        m[i] = m[i].map((x, k) => sub(x, mul(f, m[row][k])));
      }
    }
    pivots.push(c);
    row++;
  }
  const free = [...Array(cols).keys()].filter((c) => !pivots.includes(c));
  if (free.length !== 1) throw new Error(free.length === 0 ? 'this equation cannot be balanced' : 'more than one independent way to balance this: split it into separate reactions');
  // set the free coefficient to 1, solve the others, then scale to the smallest integers
  const f = free[0];
  const coef = Array(cols).fill(null);
  coef[f] = frac(1n);
  pivots.forEach((c, i) => { coef[c] = frac(-m[i][f][0], m[i][f][1]); });
  const lcm = coef.reduce((l, [, d]) => (l * d) / gcd(l, d), 1n);
  let ints = coef.map(([n, d]) => (n * lcm) / d);
  const g = ints.reduce((a, b) => gcd(a, b));
  ints = ints.map((x) => x / g);
  if (ints.some((x) => x <= 0n)) throw new Error('no balance with positive coefficients: check the formulas');
  return { lhs, rhs, species, coef: ints.map(Number) };
}

function show({ lhs, species, coef }) {
  const term = (i) => (coef[i] === 1 ? '' : coef[i] + ' ') + species[i];
  const left = lhs.map((_, i) => term(i)).join(' + ');
  const right = species.slice(lhs.length).map((_, k) => term(lhs.length + k)).join(' + ');
  return `${left} -> ${right}`;
}

const args = process.argv.slice(2);
if (!args[0]) {
  console.log('usage: node balance.js "A + B -> C + D" [--have A=grams ...] [--actual C=grams]');
  process.exit(0);
}
const eq = balance(args[0]);
console.log(show(eq));
const parse = (flag) => {
  const i = args.indexOf(flag);
  if (i < 0) return {};
  const out = {};
  for (const a of args.slice(i + 1)) {
    if (a.startsWith('--')) break;
    const [s, g] = a.split('=');
    out[s] = Number(g);
  }
  return out;
};
const have = parse('--have');
if (Object.keys(have).length) {
  // moles of reaction each reactant allows: n / coefficient. The smallest one limits.
  let extent = Infinity, limiting = null;
  for (const [s, g] of Object.entries(have)) {
    const i = eq.species.indexOf(s);
    if (i < 0 || i >= eq.lhs.length) throw new Error(`${s} is not a reactant`);
    const x = g / molarMass(s) / eq.coef[i];
    if (x < extent) { extent = x; limiting = s; }
  }
  console.log(`\n${Object.keys(have).length > 1 ? `limiting reagent: ${limiting}` : `from ${have[limiting]} g of ${limiting}`}, ${extent.toPrecision(4)} mol of reaction\n`);
  console.log('species       M (g/mol)    mol        grams');
  eq.species.forEach((s, i) => {
    const n = extent * eq.coef[i];
    const used = i < eq.lhs.length ? (have[s] !== undefined ? `used, ${(have[s] - n * molarMass(s)).toFixed(2)} g left over` : 'needed') : 'made';
    console.log(`  ${s.padEnd(10)} ${molarMass(s).toFixed(3).padStart(9)}  ${n.toFixed(4).padStart(9)}  ${(n * molarMass(s)).toFixed(2).padStart(9)}   ${used}`);
  });
  const actual = parse('--actual');
  for (const [s, g] of Object.entries(actual)) {
    const i = eq.species.indexOf(s);
    const theory = extent * eq.coef[i] * molarMass(s);
    console.log(`\npercent yield of ${s}: ${g} / ${theory.toFixed(2)} g = ${(100 * g / theory).toFixed(1)} %`);
  }
}
