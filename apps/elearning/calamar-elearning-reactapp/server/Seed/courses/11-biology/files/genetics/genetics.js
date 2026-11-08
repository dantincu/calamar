// genetics.js: Mendelian crosses, Hardy-Weinberg, and allele frequencies under selection and drift.
//
//   node genetics.js cross Aa Aa                  offspring genotypes and phenotypes (capital = dominant)
//   node genetics.js cross AaBb AaBb              two independent genes: the 9:3:3:1 ratio
//   node genetics.js hw 298 489 213               Hardy-Weinberg test from counts of AA, Aa, aa
//   node genetics.js select 0.01 1 1 0.9 200      p0, fitness of AA, Aa, aa, generations (deterministic)
//   node genetics.js drift 0.5 20 100 5 [seed]    p0, population size N, generations, runs (Wright-Fisher)

// ---------------------------------------------------------------- crosses
function gametes(genotype) {
  // "AaBb" -> genes ["Aa", "Bb"] -> gametes AB, Ab, aB, ab (independent assortment)
  const genes = genotype.match(/../g);
  return genes.reduce((acc, g) => acc.flatMap((prefix) => [prefix + g[0], prefix + g[1]]), ['']);
}

function cross(p1, p2) {
  if (p1.length !== p2.length || p1.length % 2) throw new Error('give both parents the same genes, two letters each, e.g. AaBb');
  const counts = new Map();
  for (const g1 of gametes(p1)) {
    for (const g2 of gametes(p2)) {
      // pair the alleles gene by gene, dominant (capital) first: "A"+"a" -> "Aa"
      let child = '';
      for (let i = 0; i < g1.length; i++) child += [g1[i], g2[i]].sort().join('');
      counts.set(child, (counts.get(child) ?? 0) + 1);
    }
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  console.log(`${p1} x ${p2}: ${gametes(p1).length} x ${gametes(p2).length} = ${total} equally likely combinations\n`);
  console.log('genotype   fraction');
  for (const [g, n] of [...counts].sort()) console.log(`  ${g.padEnd(8)} ${n}/${total}`);
  const pheno = new Map();
  for (const [g, n] of counts) {
    const p = g.match(/../g).map((pair) => (pair[0] === pair[0].toUpperCase() ? pair[0].toUpperCase() : pair[0])).join(' ');
    pheno.set(p, (pheno.get(p) ?? 0) + n);
  }
  console.log('\nphenotype (dominant trait shown in capitals)');
  for (const [p, n] of [...pheno].sort((a, b) => b[1] - a[1])) console.log(`  ${p.padEnd(8)} ${n}/${total}`);
}

// ---------------------------------------------------------------- Hardy-Weinberg
function hardyWeinberg(nAA, nAa, naa) {
  const n = nAA + nAa + naa;
  const p = (2 * nAA + nAa) / (2 * n), q = 1 - p;
  const expected = [p * p * n, 2 * p * q * n, q * q * n];
  const observed = [nAA, nAa, naa];
  const chi2 = observed.reduce((s, o, i) => s + (o - expected[i]) ** 2 / expected[i], 0);
  console.log(`n = ${n} individuals, p(A) = ${p.toFixed(4)}, q(a) = ${q.toFixed(4)}\n`);
  console.log('genotype  observed  expected');
  ['AA', 'Aa', 'aa'].forEach((g, i) => console.log(`  ${g}      ${String(observed[i]).padStart(6)}  ${expected[i].toFixed(1).padStart(8)}`));
  console.log(`\nchi-square = ${chi2.toFixed(3)} with 1 degree of freedom (critical value 3.841 at the 5 % level)`);
  console.log(chi2 < 3.841 ? 'consistent with Hardy-Weinberg equilibrium' : 'NOT in Hardy-Weinberg equilibrium: something (selection, non-random mating, migration...) is going on');
}

// ---------------------------------------------------------------- selection
function select(p0, wAA, wAa, waa, generations) {
  let p = p0;
  console.log(`fitness AA ${wAA}, Aa ${wAa}, aa ${waa}; p(A) at the start ${p0}\n`);
  console.log('generation   p(A)     q(a)    mean fitness');
  const step = Math.max(1, Math.round(generations / 10));
  for (let t = 0; t <= generations; t++) {
    const q = 1 - p;
    const wbar = p * p * wAA + 2 * p * q * wAa + q * q * waa;
    if (t % step === 0 || t === generations) {
      console.log(`${String(t).padStart(6)}     ${p.toFixed(4)}   ${q.toFixed(4)}   ${wbar.toFixed(4)}`);
    }
    p = (p * p * wAA + p * q * wAa) / wbar;
  }
  if (wAa > wAA && wAa > waa) {
    const s = 1 - wAA / wAa, t = 1 - waa / wAa;
    console.log(`\nheterozygote advantage: equilibrium p(A) = t/(s+t) = ${(t / (s + t)).toFixed(4)}, q(a) = s/(s+t) = ${(s / (s + t)).toFixed(4)}`);
  }
}

// ---------------------------------------------------------------- drift
// mulberry32: a small seeded random number generator, so runs are repeatable.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drift(p0, N, generations, runs, seed = 42) {
  const rand = rng(seed);
  console.log(`Wright-Fisher drift: N = ${N} individuals (${2 * N} gene copies), p0 = ${p0}, no selection, seed ${seed}\n`);
  const marks = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].filter((g) => g <= generations);
  console.log('run  ' + marks.map((g) => `g${g}`.padStart(6)).join(''));
  let lost = 0, fixed = 0;
  for (let r = 1; r <= runs; r++) {
    let p = p0;
    const row = [];
    for (let t = 0; t <= generations; t++) {
      if (marks.includes(t)) row.push(p.toFixed(2).padStart(6));
      let copies = 0;
      for (let i = 0; i < 2 * N; i++) if (rand() < p) copies++;   // each copy of the next generation is drawn at random
      p = copies / (2 * N);
    }
    if (p === 0) lost++;
    if (p === 1) fixed++;
    console.log(`${String(r).padStart(3)}  ${row.join('')}`);
  }
  console.log(`\nafter ${generations} generations: A fixed in ${fixed} runs, lost in ${lost}, still polymorphic in ${runs - fixed - lost}`);
  console.log(`expected heterozygosity left: H_t/H_0 = (1 - 1/2N)^t = ${((1 - 1 / (2 * N)) ** generations).toFixed(3)}`);
}

const [cmd, ...args] = process.argv.slice(2);
const n = args.map(Number);
if (cmd === 'cross') cross(args[0], args[1]);
else if (cmd === 'hw') hardyWeinberg(n[0], n[1], n[2]);
else if (cmd === 'select') select(n[0], n[1], n[2], n[3], n[4] || 100);
else if (cmd === 'drift') drift(n[0], n[1], n[2] || 100, n[3] || 5, n[4] || 42);
else console.log('usage: node genetics.js cross|hw|select|drift ... (see the top of the file)');
