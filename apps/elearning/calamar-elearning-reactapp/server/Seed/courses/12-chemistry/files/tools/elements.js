// elements.js: a small periodic table (elements 1-36 and some heavier common ones), a formula parser,
// and electron configurations. Used by chem.js and balance.js.

// symbol: [Z, name, standard atomic weight, Pauling electronegativity or null]
const ELEMENTS = {
  H: [1, 'hydrogen', 1.008, 2.20], He: [2, 'helium', 4.0026, null],
  Li: [3, 'lithium', 6.94, 0.98], Be: [4, 'beryllium', 9.0122, 1.57], B: [5, 'boron', 10.81, 2.04],
  C: [6, 'carbon', 12.011, 2.55], N: [7, 'nitrogen', 14.007, 3.04], O: [8, 'oxygen', 15.999, 3.44],
  F: [9, 'fluorine', 18.998, 3.98], Ne: [10, 'neon', 20.180, null],
  Na: [11, 'sodium', 22.990, 0.93], Mg: [12, 'magnesium', 24.305, 1.31], Al: [13, 'aluminium', 26.982, 1.61],
  Si: [14, 'silicon', 28.085, 1.90], P: [15, 'phosphorus', 30.974, 2.19], S: [16, 'sulfur', 32.06, 2.58],
  Cl: [17, 'chlorine', 35.45, 3.16], Ar: [18, 'argon', 39.948, null],
  K: [19, 'potassium', 39.098, 0.82], Ca: [20, 'calcium', 40.078, 1.00], Sc: [21, 'scandium', 44.956, 1.36],
  Ti: [22, 'titanium', 47.867, 1.54], V: [23, 'vanadium', 50.942, 1.63], Cr: [24, 'chromium', 51.996, 1.66],
  Mn: [25, 'manganese', 54.938, 1.55], Fe: [26, 'iron', 55.845, 1.83], Co: [27, 'cobalt', 58.933, 1.88],
  Ni: [28, 'nickel', 58.693, 1.91], Cu: [29, 'copper', 63.546, 1.90], Zn: [30, 'zinc', 65.38, 1.65],
  Ga: [31, 'gallium', 69.723, 1.81], Ge: [32, 'germanium', 72.630, 2.01], As: [33, 'arsenic', 74.922, 2.18],
  Se: [34, 'selenium', 78.971, 2.55], Br: [35, 'bromine', 79.904, 2.96], Kr: [36, 'krypton', 83.798, 3.00],
  Ag: [47, 'silver', 107.87, 1.93], Sn: [50, 'tin', 118.71, 1.96], I: [53, 'iodine', 126.90, 2.66],
  Ba: [56, 'barium', 137.33, 0.89], Pt: [78, 'platinum', 195.08, 2.28], Au: [79, 'gold', 196.97, 2.54],
  Hg: [80, 'mercury', 200.59, 2.00], Pb: [82, 'lead', 207.2, 2.33], U: [92, 'uranium', 238.03, 1.38],
};

function element(symbol) {
  const e = ELEMENTS[symbol];
  if (!e) throw new Error(`unknown element "${symbol}" (this small table has elements 1-36 and ${Object.keys(ELEMENTS).filter((s) => ELEMENTS[s][0] > 36).join(', ')})`);
  return { symbol, Z: e[0], name: e[1], mass: e[2], en: e[3] };
}

// Parse a formula into element counts: "Ca(OH)2" -> { Ca: 1, O: 2, H: 2 }, "CuSO4.5H2O" -> hydrate.
function parseFormula(formula) {
  const parts = formula.split(/[.·*]/);
  const total = {};
  for (const part of parts) {
    const m = part.match(/^(\d+)(.*)$/);
    const mult = m ? Number(m[1]) : 1;
    const counts = parseGroup(m ? m[2] : part);
    for (const [el, n] of Object.entries(counts)) total[el] = (total[el] ?? 0) + n * mult;
  }
  return total;
}

function parseGroup(s) {
  let i = 0;
  function group() {
    const counts = {};
    while (i < s.length && s[i] !== ')' && s[i] !== ']') {
      let sub;
      if (s[i] === '(' || s[i] === '[') {
        i++;
        sub = group();
        if (s[i] !== ')' && s[i] !== ']') throw new Error(`unbalanced parentheses in "${s}"`);
        i++;
      } else {
        const m = s.slice(i).match(/^[A-Z][a-z]?/);
        if (!m) throw new Error(`can't read "${s.slice(i)}" in "${s}"`);
        element(m[0]);
        i += m[0].length;
        sub = { [m[0]]: 1 };
      }
      const n = s.slice(i).match(/^\d+/);
      const k = n ? Number(n[0]) : 1;
      if (n) i += n[0].length;
      for (const [el, c] of Object.entries(sub)) counts[el] = (counts[el] ?? 0) + c * k;
    }
    return counts;
  }
  const result = group();
  if (i !== s.length) throw new Error(`unbalanced parentheses in "${s}"`);
  return result;
}

function molarMass(formula) {
  return Object.entries(parseFormula(formula)).reduce((sum, [el, n]) => sum + element(el).mass * n, 0);
}

// Electron configuration by the aufbau (Madelung) order, with the common exceptions.
const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const CAPACITY = { s: 2, p: 6, d: 10, f: 14 };
const EXCEPTIONS = { 24: ['4s', 1, '3d', 5], 29: ['4s', 1, '3d', 10], 47: ['5s', 1, '4d', 10], 79: ['6s', 1, '5d', 10] };

function electronConfiguration(Z) {
  const filled = [];
  let left = Z;
  for (const sub of ORDER) {
    if (left === 0) break;
    const n = Math.min(left, CAPACITY[sub[1]]);
    filled.push([sub, n]);
    left -= n;
  }
  const ex = EXCEPTIONS[Z];
  if (ex) {
    for (const f of filled) {
      if (f[0] === ex[0]) f[1] = ex[1];
      if (f[0] === ex[2]) f[1] = ex[3];
    }
  }
  // write in order of shell number, as chemists usually do
  filled.sort((a, b) => a[0][0] - b[0][0] || 'spdf'.indexOf(a[0][1]) - 'spdf'.indexOf(b[0][1]));
  return filled.map(([s, n]) => `${s}${n}`).join(' ');
}

module.exports = { ELEMENTS, element, parseFormula, molarMass, electronConfiguration };
