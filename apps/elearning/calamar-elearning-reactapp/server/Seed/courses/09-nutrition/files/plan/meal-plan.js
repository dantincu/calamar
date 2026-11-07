// meal-plan.js: add up a day of meals and compare it with the daily targets.
//
//   node meal-plan.js                         # every day in day-plan.json, for a 2000 kcal / 65 kg adult
//   node meal-plan.js day-plan.json improved --kcal 2300 --weight 80
//
// Needs foods.json (nutrients per 100 g) next to it. Edit day-plan.json to check your own days.

const fs = require('fs');
const path = require('path');

const here = __dirname;
const args = process.argv.slice(2);
const opts = { kcal: 2000, weight: 65 };
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) opts[args[i].slice(2)] = Number(args[++i]);
  else positional.push(args[i]);
}
const planFile = positional[0] ?? path.join(here, 'day-plan.json');
const only = positional[1];

const foods = JSON.parse(fs.readFileSync(path.join(here, 'foods.json'), 'utf8')).foods;
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8')).days;

const NUTRIENTS = ['kcal', 'protein', 'carbs', 'sugars', 'fat', 'sat', 'fiber', 'salt'];

function totals(day) {
  const t = Object.fromEntries(NUTRIENTS.map((n) => [n, 0]));
  t.fruitVeg = 0;
  t.freeSugars = 0;
  for (const [meal, items] of Object.entries(day)) {
    for (const [food, grams] of Object.entries(items)) {
      const f = foods[food];
      if (!f) throw new Error(`"${food}" (in ${meal}) is not in foods.json`);
      for (const n of NUTRIENTS) t[n] += (f[n] * grams) / 100;
      if (f.fruitVeg) t.fruitVeg += grams;
      if (f.freeSugar) t.freeSugars += (f.sugars * grams) / 100;
    }
  }
  return t;
}

// [label, value, target text, ok?]
function checks(t) {
  const k = opts.kcal;
  const pctE = (g, kcalPerG) => (100 * g * kcalPerG) / t.kcal;
  return [
    ['Energy', `${Math.round(t.kcal)} kcal`, `${k} kcal +-10 %`, Math.abs(t.kcal - k) <= 0.1 * k],
    ['Protein', `${Math.round(t.protein)} g`, `>= ${Math.round(0.83 * opts.weight)} g`, t.protein >= 0.83 * opts.weight],
    ['Fat', `${Math.round(pctE(t.fat, 9))} % of energy`, '20-35 %', pctE(t.fat, 9) >= 20 && pctE(t.fat, 9) <= 35],
    ['Saturated fat', `${pctE(t.sat, 9).toFixed(1)} % of energy`, '< 10 %', pctE(t.sat, 9) < 10],
    ['Carbohydrate', `${Math.round(pctE(t.carbs, 4))} % of energy`, '45-60 %', pctE(t.carbs, 4) >= 45 && pctE(t.carbs, 4) <= 60],
    ['Free sugars', `${Math.round(pctE(t.freeSugars, 4))} % of energy`, '< 10 % (ideally < 5 %)', pctE(t.freeSugars, 4) < 10],
    ['Fiber', `${Math.round(t.fiber)} g`, '>= 25 g', t.fiber >= 25],
    ['Salt', `${t.salt.toFixed(1)} g`, '< 5 g', t.salt < 5],
    ['Fruit and veg', `${Math.round(t.fruitVeg)} g`, '>= 400 g', t.fruitVeg >= 400],
  ];
}

let failed = false;
for (const [name, day] of Object.entries(plan)) {
  if (only && name !== only) continue;
  let t;
  try { t = totals(day); } catch (e) { console.error(`error: ${e.message}`); process.exitCode = 1; failed = true; continue; }
  console.log(`\n== ${name} ==`);
  let ok = 0;
  const rows = checks(t);
  for (const [label, value, target, pass] of rows) {
    if (pass) ok++;
    console.log(`  ${pass ? 'ok  ' : 'MISS'}  ${label.padEnd(14)} ${value.padEnd(18)} target ${target}`);
  }
  console.log(`  ${ok}/${rows.length} targets met`);
}
if (only && !plan[only] && !failed) { console.error(`error: no day called "${only}"`); process.exitCode = 1; }
