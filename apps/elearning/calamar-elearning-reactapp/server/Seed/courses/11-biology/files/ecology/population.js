// population.js: population growth and predator-prey cycles.
//
//   node population.js exp 100 0.3 20                 N0, r (per year), years: exponential growth
//   node population.js logistic 100 0.3 1000 40       N0, r, carrying capacity K, years
//   node population.js lv 40 9 30                     prey0, predators0, years: Lotka-Volterra (RK4)
//   node population.js shannon 40 30 20 10            counts per species: diversity indices

function table(rows, header) {
  console.log(header);
  for (const r of rows) console.log(r);
}

function exponential(N0, r, years) {
  const rows = [];
  for (let t = 0; t <= years; t += Math.max(1, Math.round(years / 10))) {
    rows.push(`${String(t).padStart(4)}  ${Math.round(N0 * Math.exp(r * t)).toString().padStart(10)}`);
  }
  table(rows, 'year  population  (N = N0 e^(rt))');
  console.log(`\ndoubling time = ln 2 / r = ${(Math.LN2 / r).toFixed(2)} years`);
}

function logistic(N0, r, K, years) {
  const rows = [];
  for (let t = 0; t <= years; t += Math.max(1, Math.round(years / 10))) {
    const N = K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
    const dN = r * N * (1 - N / K);
    rows.push(`${String(t).padStart(4)}  ${N.toFixed(0).padStart(8)}  ${dN.toFixed(1).padStart(10)}`);
  }
  table(rows, 'year  population  growth/yr  (N = K / (1 + ((K-N0)/N0) e^(-rt)))');
  console.log(`\nfastest growth at N = K/2 = ${K / 2}: r K / 4 = ${(r * K / 4).toFixed(1)} per year (the "maximum sustainable yield")`);
}

// Lotka-Volterra: dx/dt = a x - b x y (prey), dy/dt = d b x y - c y (predators)
function lotkaVolterra(x0, y0, years, a = 1.0, b = 0.1, c = 1.5, d = 0.375) {
  const f = ([x, y]) => [a * x - b * x * y, d * b * x * y - c * y];
  const h = 0.001;
  let s = [x0, y0];
  console.log(`a=${a} (prey births), b=${b} (predation), c=${c} (predator deaths), d=${d} (conversion)`);
  console.log(`equilibrium: prey c/(d b) = ${(c / (d * b)).toFixed(1)}, predators a/b = ${(a / b).toFixed(1)}\n`);
  console.log('  time    prey  predators');
  const steps = Math.round(years / h), every = Math.round(1 / h);
  let maxPrey = 0, minPrey = Infinity;
  for (let i = 0; i <= steps; i++) {
    if (i % every === 0 && i / every <= 30) console.log(`${(i * h).toFixed(1).padStart(6)}  ${s[0].toFixed(1).padStart(6)}  ${s[1].toFixed(1).padStart(9)}`);
    maxPrey = Math.max(maxPrey, s[0]); minPrey = Math.min(minPrey, s[0]);
    // one Runge-Kutta (RK4) step
    const k1 = f(s);
    const k2 = f(s.map((v, j) => v + (h / 2) * k1[j]));
    const k3 = f(s.map((v, j) => v + (h / 2) * k2[j]));
    const k4 = f(s.map((v, j) => v + h * k3[j]));
    s = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  console.log(`\nprey oscillates between ${minPrey.toFixed(1)} and ${maxPrey.toFixed(1)}`);
}

function shannon(counts) {
  const N = counts.reduce((a, b) => a + b, 0);
  const p = counts.map((n) => n / N);
  const H = -p.reduce((s, pi) => s + (pi > 0 ? pi * Math.log(pi) : 0), 0);
  const simpson = 1 - p.reduce((s, pi) => s + pi * pi, 0);
  console.log(`${counts.length} species, ${N} individuals`);
  console.log(`Shannon index      H = -sum p ln p = ${H.toFixed(3)}  (maximum ln S = ${Math.log(counts.length).toFixed(3)})`);
  console.log(`evenness           H / ln S = ${(H / Math.log(counts.length)).toFixed(3)}`);
  console.log(`Gini-Simpson index 1 - sum p^2 = ${simpson.toFixed(3)} (chance two random individuals are different species)`);
}

const [cmd, ...args] = process.argv.slice(2);
const n = args.map(Number);
if (cmd === 'exp') exponential(n[0], n[1], n[2]);
else if (cmd === 'logistic') logistic(n[0], n[1], n[2], n[3]);
else if (cmd === 'lv') lotkaVolterra(n[0], n[1], n[2] || 30);
else if (cmd === 'shannon') shannon(n);
else console.log('usage: node population.js exp|logistic|lv|shannon ... (see the top of the file)');
