// ph.js: pH of acids, bases and buffers, and a titration curve. At 25 °C, Kw = 1e-14.
//
//   node ph.js strong-acid 0.01               pH of a strong acid (HCl) at 0.01 mol/L
//   node ph.js strong-base 0.01               pH of a strong base (NaOH)
//   node ph.js weak-acid 0.1 4.76             concentration, pKa (acetic acid): exact and approximate pH
//   node ph.js weak-base 0.1 9.25             concentration, pKa of the conjugate acid (ammonia/ammonium)
//   node ph.js buffer 4.76 0.1 0.1            pKa, [acid], [base]: Henderson-Hasselbalch
//   node ph.js titrate 0.1 25 0.1 4.76        acid mol/L, acid mL, NaOH mol/L, pKa (omit pKa for a strong acid)

process.on("uncaughtException", (e) => { console.error(`error: ${e.message}`); process.exit(1); });

const KW = 1e-14;

// Exact [H+] for a weak acid HA of total concentration C plus a strong base of concentration B (Na+),
// from the charge balance [H+] + [Na+] = [OH-] + [A-], solved by bisection on log [H+].
function hydrogenIon(C, Ka, B = 0) {
  const f = (h) => h + B - KW / h - (Ka === Infinity ? C : (C * Ka) / (Ka + h));
  let lo = -15, hi = 1;   // log10 [H+]
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(10 ** mid) > 0) hi = mid; else lo = mid;
  }
  return 10 ** ((lo + hi) / 2);
}
const pH = (h) => -Math.log10(h);

const [cmd, ...a] = process.argv.slice(2);
const n = a.map(Number);

if (cmd === 'strong-acid') {
  const h = hydrogenIon(n[0], Infinity);
  console.log(`[H+] = ${h.toExponential(3)} mol/L, pH = ${pH(h).toFixed(2)}  (simple estimate: -log ${n[0]} = ${(-Math.log10(n[0])).toFixed(2)})`);
} else if (cmd === 'strong-base') {
  const oh = n[0], h = KW / oh;
  console.log(`[OH-] = ${oh} mol/L, pOH = ${(-Math.log10(oh)).toFixed(2)}, pH = 14 - pOH = ${pH(h).toFixed(2)}`);
} else if (cmd === 'weak-acid') {
  const [C, pKa] = n, Ka = 10 ** -pKa;
  const h = hydrogenIon(C, Ka);
  const approx = Math.sqrt(Ka * C);
  console.log(`Ka = 10^-${pKa} = ${Ka.toExponential(3)}`);
  console.log(`exact:  [H+] = ${h.toExponential(3)}, pH = ${pH(h).toFixed(2)}`);
  console.log(`approx: [H+] = sqrt(Ka C) = ${approx.toExponential(3)}, pH = ${pH(approx).toFixed(2)}`);
  console.log(`fraction dissociated: ${(100 * h / C).toFixed(2)} %`);
} else if (cmd === 'weak-base') {
  const [C, pKa] = n, Kb = KW / 10 ** -pKa;
  const oh = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * C)) / 2;
  console.log(`Kb = Kw / Ka = ${Kb.toExponential(3)}, [OH-] = ${oh.toExponential(3)}, pOH = ${(-Math.log10(oh)).toFixed(2)}, pH = ${pH(KW / oh).toFixed(2)}`);
} else if (cmd === 'buffer') {
  const [pKa, HA, Aminus] = n;
  console.log(`pH = pKa + log([A-]/[HA]) = ${pKa} + log(${Aminus}/${HA}) = ${(pKa + Math.log10(Aminus / HA)).toFixed(2)}`);
} else if (cmd === 'titrate') {
  const [Ca, Va, Cb, pKa] = n;
  const Ka = Number.isFinite(pKa) ? 10 ** -pKa : Infinity;
  const Veq = (Ca * Va) / Cb;
  console.log(`${Va} mL of ${Ca} M ${Ka === Infinity ? 'strong acid' : `weak acid (pKa ${pKa})`} with ${Cb} M NaOH: equivalence at ${Veq.toFixed(2)} mL\n`);
  console.log('  NaOH mL    pH');
  const marks = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1, 1.01, 1.1, 1.5, 2].map((f) => f * Veq);
  for (const Vb of marks) {
    const V = Va + Vb;
    const h = hydrogenIon((Ca * Va) / V, Ka, (Cb * Vb) / V);
    const note = Math.abs(Vb - Veq / 2) < 1e-9 && Ka !== Infinity ? '   half-way: pH = pKa' : Math.abs(Vb - Veq) < 1e-9 ? '   equivalence point' : '';
    console.log(`  ${Vb.toFixed(2).padStart(7)}  ${pH(h).toFixed(2).padStart(5)}${note}`);
  }
} else {
  console.log('usage: node ph.js strong-acid|strong-base|weak-acid|weak-base|buffer|titrate ... (see the top of the file)');
}
