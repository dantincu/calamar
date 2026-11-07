// label-check.js: read an EU nutrition declaration like a nutritionist.
//
//   node label-check.js --kcal 452 --fat 22 --sat 9.5 --carbs 57 --sugars 31 --fiber 2.4 --protein 5.8 --salt 0.6 --portion 40
//   node label-check.js --kcal 66 --fat 3.5 --sat 2.3 --carbs 4.7 --sugars 4.7 --protein 3.4 --salt 0.13 --portion 250 --drink
//
// All values are per 100 g (or 100 ml for --drink), as printed on the label. --portion is the amount you eat.
// --sodium may be given instead of --salt (salt = sodium x 2.5).

// EU Regulation 1169/2011, Annex XIII: reference intakes for an average adult.
const RI = { kcal: 2000, fat: 70, sat: 20, carbs: 260, sugars: 90, protein: 50, salt: 6 };

// UK front-of-pack "traffic light" criteria, per 100 g of food / per 100 ml of drink: [low <=, high >].
const LIGHTS = {
  food: { fat: [3, 17.5], sat: [1.5, 5], sugars: [5, 22.5], salt: [0.3, 1.5] },
  drink: { fat: [1.5, 8.75], sat: [0.75, 2.5], sugars: [2.5, 11.25], salt: [0.3, 0.75] },
};

// EU energy conversion factors (Annex XIV), kcal per gram.
const ATWATER = { fat: 9, carbs: 4, protein: 4, fiber: 2 };

function light(value, [low, high]) {
  if (value <= low) return 'LOW   (green)';
  if (value > high) return 'HIGH  (red)';
  return 'MEDIUM (amber)';
}

function main() {
  const a = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i].replace(/^--/, '');
    if (k === 'drink') { a.drink = true; continue; }
    a[k] = Number(argv[++i]);
  }
  if (a.salt === undefined && a.sodium !== undefined) a.salt = a.sodium * 2.5;
  for (const k of ['kcal', 'fat', 'sat', 'carbs', 'sugars', 'protein', 'salt']) {
    if (!Number.isFinite(a[k])) { console.error(`error: --${k} is missing`); process.exitCode = 1; return; }
  }
  const fiber = a.fiber ?? 0;
  const portion = a.portion ?? 100;
  const unit = a.drink ? 'ml' : 'g';
  const lights = LIGHTS[a.drink ? 'drink' : 'food'];

  console.log(`Per 100 ${unit}:`);
  for (const k of ['fat', 'sat', 'sugars', 'salt']) {
    const name = { fat: 'Fat', sat: 'Saturates', sugars: 'Sugars', salt: 'Salt' }[k];
    console.log(`  ${name.padEnd(10)} ${String(a[k]).padStart(5)} g  ${light(a[k], lights[k])}`);
  }

  // Where does the energy come from?
  const fromFat = a.fat * ATWATER.fat, fromCarbs = a.carbs * ATWATER.carbs;
  const fromProtein = a.protein * ATWATER.protein, fromFiber = fiber * ATWATER.fiber;
  const computed = fromFat + fromCarbs + fromProtein + fromFiber;
  const pct = (x) => `${Math.round((100 * x) / computed)} %`;
  console.log(`\nEnergy check: ${Math.round(computed)} kcal computed from the nutrients vs ${a.kcal} kcal on the label` +
    (Math.abs(computed - a.kcal) > 0.08 * a.kcal ? '  <- more than 8 % apart: re-check the numbers you typed' : ''));
  console.log(`  from fat ${pct(fromFat)}, carbohydrate ${pct(fromCarbs)}, protein ${pct(fromProtein)}` + (fiber ? `, fiber ${pct(fromFiber)}` : ''));
  console.log(`  sugars are ${Math.round((100 * a.sugars) / Math.max(a.carbs, 1e-9))} % of the carbohydrate`);

  console.log(`\nOne portion of ${portion} ${unit}, as % of the reference intake:`);
  const f = portion / 100;
  for (const k of ['kcal', 'fat', 'sat', 'carbs', 'sugars', 'protein', 'salt']) {
    const v = a[k] * f;
    const name = { kcal: 'Energy', fat: 'Fat', sat: 'Saturates', carbs: 'Carbohydrate', sugars: 'Sugars', protein: 'Protein', salt: 'Salt' }[k];
    console.log(`  ${name.padEnd(13)} ${(k === 'kcal' ? Math.round(v) + ' kcal' : v.toFixed(1) + ' g').padStart(9)}  ${String(Math.round((100 * v) / RI[k])).padStart(3)} %`);
  }
  if (fiber) console.log(`  ${'Fiber'.padEnd(13)} ${(fiber * f).toFixed(1).padStart(7)} g  ${String(Math.round((100 * fiber * f) / 25)).padStart(3)} % of 25 g`);
  console.log(`\nProtein density: ${((100 * a.protein) / Math.max(a.kcal, 1e-9)).toFixed(1)} g per 100 kcal` +
    `  (eggs ~8.8, lentils ~7, bread ~3.5, biscuits ~1.3)`);
}

main();
