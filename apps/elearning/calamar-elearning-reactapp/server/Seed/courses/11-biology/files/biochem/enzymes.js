// enzymes.js: Michaelis-Menten kinetics, and estimating Vmax and Km from measurements.
//
//   node enzymes.js curve 10 2                 Vmax, Km: reaction rate for a range of substrate concentrations
//   node enzymes.js fit 0.5:2.0 1:3.3 2:5.0 4:6.7 8:8.0     [S]:v pairs: Lineweaver-Burk fit
//   node enzymes.js inhibit 10 2 1 0.5         Vmax, Km, inhibitor [I], Ki: competitive vs non-competitive

const rate = (S, Vmax, Km) => (Vmax * S) / (Km + S);

function curve(Vmax, Km) {
  console.log(`v = Vmax [S] / (Km + [S]), Vmax = ${Vmax}, Km = ${Km}\n`);
  console.log('   [S]       v    % of Vmax');
  for (const S of [0.25, 0.5, 1, 2, 4, 8, 16, 32, 100].map((f) => f * Km / 2)) {
    const v = rate(S, Vmax, Km);
    console.log(`${S.toFixed(2).padStart(6)}  ${v.toFixed(2).padStart(6)}  ${(100 * v / Vmax).toFixed(0).padStart(6)} %`);
  }
}

// Least squares line through (1/[S], 1/v): slope = Km/Vmax, intercept = 1/Vmax.
function fit(pairs) {
  const pts = pairs.map((p) => p.split(':').map(Number)).map(([S, v]) => [1 / S, 1 / v]);
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  const slope = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const intercept = my - slope * mx;
  const Vmax = 1 / intercept, Km = slope * Vmax;
  console.log('  1/[S]     1/v');
  for (const [x, y] of pts) console.log(`${x.toFixed(3).padStart(7)}  ${y.toFixed(3).padStart(7)}`);
  console.log(`\nline: 1/v = ${slope.toFixed(4)} (1/[S]) + ${intercept.toFixed(4)}`);
  console.log(`Vmax = 1/intercept = ${Vmax.toFixed(2)}, Km = slope x Vmax = ${Km.toFixed(2)}`);
}

function inhibit(Vmax, Km, I, Ki) {
  const alpha = 1 + I / Ki;
  console.log(`inhibitor [I] = ${I}, Ki = ${Ki}: alpha = 1 + [I]/Ki = ${alpha.toFixed(2)}\n`);
  console.log('   [S]   none   competitive   non-competitive');
  for (const S of [0.5, 1, 2, 4, 8, 20, 100]) {
    console.log(`${String(S).padStart(6)}  ${rate(S, Vmax, Km).toFixed(2).padStart(5)}  ${rate(S, Vmax, alpha * Km).toFixed(2).padStart(12)}  ${rate(S, Vmax / alpha, Km).toFixed(2).padStart(16)}`);
  }
  console.log(`\ncompetitive: apparent Km = ${(alpha * Km).toFixed(2)}, Vmax unchanged (enough substrate wins)`);
  console.log(`non-competitive: apparent Vmax = ${(Vmax / alpha).toFixed(2)}, Km unchanged`);
}

const [cmd, ...args] = process.argv.slice(2);
const n = args.map(Number);
if (cmd === 'curve') curve(n[0], n[1]);
else if (cmd === 'fit') fit(args);
else if (cmd === 'inhibit') inhibit(n[0], n[1], n[2], n[3]);
else console.log('usage: node enzymes.js curve|fit|inhibit ... (see the top of the file)');
