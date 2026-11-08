// chem.js: molar masses, composition, moles and electron configurations.
//
//   node chem.js mass H2O Ca(OH)2 CuSO4.5H2O      molar masses (g/mol)
//   node chem.js comp C6H12O6                      mass percent of each element
//   node chem.js moles NaCl 5.85                   grams -> moles and number of formula units
//   node chem.js grams CO2 0.25                    moles -> grams
//   node chem.js element Fe Cl Cu                  Z, mass, electronegativity, electron configuration
//   node chem.js bond Na Cl                        electronegativity difference and bond type
//   node chem.js empirical C:40.0 H:6.7 O:53.3     empirical formula from mass percentages

process.on("uncaughtException", (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const { element, parseFormula, molarMass, electronConfiguration } = require('./elements');

const NA = 6.02214076e23;   // Avogadro constant, per mole (exact since 2019)

const [cmd, ...args] = process.argv.slice(2);

if (cmd === 'mass') {
  for (const f of args) console.log(`${f.padEnd(14)} ${molarMass(f).toFixed(3)} g/mol`);
} else if (cmd === 'comp') {
  const f = args[0];
  const M = molarMass(f);
  console.log(`${f}: ${M.toFixed(3)} g/mol`);
  for (const [el, n] of Object.entries(parseFormula(f))) {
    const m = element(el).mass * n;
    console.log(`  ${el.padEnd(3)} ${String(n).padStart(3)} x ${element(el).mass.toFixed(3).padStart(8)} = ${m.toFixed(3).padStart(9)} g   ${(100 * m / M).toFixed(2).padStart(6)} %`);
  }
} else if (cmd === 'moles') {
  const [f, g] = [args[0], Number(args[1])];
  const n = g / molarMass(f);
  console.log(`${g} g of ${f} / ${molarMass(f).toFixed(3)} g/mol = ${n.toPrecision(4)} mol = ${(n * NA).toExponential(3)} formula units`);
} else if (cmd === 'grams') {
  const [f, n] = [args[0], Number(args[1])];
  console.log(`${n} mol of ${f} x ${molarMass(f).toFixed(3)} g/mol = ${(n * molarMass(f)).toPrecision(4)} g`);
} else if (cmd === 'element') {
  for (const s of args) {
    const e = element(s);
    console.log(`${e.symbol.padEnd(3)} ${e.name.padEnd(11)} Z=${String(e.Z).padEnd(3)} ${e.mass.toFixed(3).padStart(8)} g/mol  EN ${e.en?.toFixed(2) ?? '-'}`.padEnd(58) + `  ${electronConfiguration(e.Z)}`);
  }
} else if (cmd === 'bond') {
  const [a, b] = args.map(element);
  if (a.en == null || b.en == null) throw new Error('no electronegativity for a noble gas');
  const d = Math.abs(a.en - b.en);
  const kind = d < 0.4 ? 'non-polar covalent' : d < 1.8 ? 'polar covalent' : 'ionic';
  // Pauling's estimate of the ionic character of a bond
  const ionic = 1 - Math.exp(-(d * d) / 4);
  console.log(`${a.symbol} (${a.en.toFixed(2)}) - ${b.symbol} (${b.en.toFixed(2)}): difference ${d.toFixed(2)} -> ${kind}, about ${(100 * ionic).toFixed(0)} % ionic character`);
} else if (cmd === 'empirical') {
  const rows = args.map((a) => a.split(':')).map(([el, pct]) => [el, Number(pct) / element(el).mass]);
  const min = Math.min(...rows.map((r) => r[1]));
  console.log('element  g per 100 g   mol      ratio');
  for (const [el, mol] of rows) {
    const pct = args.find((a) => a.startsWith(el + ':')).split(':')[1];
    console.log(`  ${el.padEnd(6)} ${pct.padStart(8)}   ${mol.toFixed(3).padStart(6)}   ${(mol / min).toFixed(2).padStart(6)}`);
  }
  // find the smallest multiplier that makes all ratios close to whole numbers
  for (let k = 1; k <= 6; k++) {
    const r = rows.map(([, mol]) => (mol / min) * k);
    if (r.every((x) => Math.abs(x - Math.round(x)) < 0.1)) {
      console.log(`empirical formula: ${rows.map(([el], i) => el + (Math.round(r[i]) === 1 ? '' : Math.round(r[i]))).join('')}`);
      break;
    }
  }
} else {
  console.log('usage: node chem.js mass|comp|moles|grams|element|bond|empirical ... (see the top of the file)');
}
