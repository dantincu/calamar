// recipe-cost.js: what a recipe or a week of meals costs, and what it gives you.
//
//   node recipe-cost.js                              # every recipe in recipes.json: cost and nutrients per portion
//   node recipe-cost.js ciorba-de-fasole             # one recipe, ingredient by ingredient
//   node recipe-cost.js --week week-menu.json        # a week for one person, day by day
//   node recipe-cost.js --shopping week-menu.json    # the shopping list for that week
//
// Needs pantry-bucharest.json (prices and nutrients) and recipes.json next to it.
// Update the prices in pantry-bucharest.json from your own receipts.

const fs = require('fs');
const path = require('path');

const here = __dirname;
const load = (f) => JSON.parse(fs.readFileSync(path.isAbsolute(f) ? f : path.resolve(f), 'utf8'));
const pantry = load(path.join(here, 'pantry-bucharest.json')).items;
const recipes = load(path.join(here, 'recipes.json')).recipes;

const KEYS = ['cost', 'kcal', 'protein', 'fat', 'sat', 'fiber', 'salt', 'fruitVeg'];
const zero = () => Object.fromEntries(KEYS.map((k) => [k, 0]));
const add = (a, b, f = 1) => { for (const k of KEYS) a[k] += b[k] * f; return a; };

// One food, `grams` as bought. Cost uses the bought weight; nutrients use the edible part.
function food(name, grams) {
  const p = pantry[name];
  if (!p) throw new Error(`"${name}" is not in pantry-bucharest.json`);
  const edible = grams * p.yield;
  const r = { cost: (p.price * grams) / 1000, fruitVeg: p.fruitVeg ? edible : 0 };
  for (const k of ['kcal', 'protein', 'fat', 'sat', 'fiber', 'salt']) r[k] = (p[k] * edible) / 100;
  return r;
}

function recipeTotal(id) {
  const rec = recipes[id];
  if (!rec) throw new Error(`no recipe "${id}" in recipes.json`);
  const t = zero();
  for (const [name, g] of Object.entries(rec.ingredients)) add(t, food(name, g));
  return t;
}

function perPortion(id) {
  const t = recipeTotal(id);
  const n = recipes[id].portions;
  for (const k of KEYS) t[k] /= n;
  return t;
}

const lei = (x) => `${x.toFixed(2)} lei`;
function summary(t) {
  return `${lei(t.cost).padStart(10)} ${String(Math.round(t.kcal)).padStart(5)} kcal ${t.protein.toFixed(0).padStart(4)} g protein ` +
    `${t.fiber.toFixed(0).padStart(3)} g fiber ${t.salt.toFixed(1).padStart(4)} g salt ${String(Math.round(t.fruitVeg)).padStart(4)} g veg`;
}

function listAll() {
  console.log('Per portion:');
  const rows = Object.keys(recipes).map((id) => [id, perPortion(id)]);
  rows.sort((a, b) => a[1].cost - b[1].cost);
  for (const [id, t] of rows) {
    console.log(`  ${recipes[id].name.slice(0, 44).padEnd(45)}${summary(t)}`);
  }
  console.log('\nProtein for 1 leu, best first:');
  rows.sort((a, b) => b[1].protein / b[1].cost - a[1].protein / a[1].cost);
  for (const [id, t] of rows.slice(0, 5)) console.log(`  ${(t.protein / t.cost).toFixed(1).padStart(5)} g  ${recipes[id].name}`);
}

function showRecipe(id) {
  const rec = recipes[id];
  if (!rec) throw new Error(`no recipe "${id}"; the recipes are: ${Object.keys(recipes).join(', ')}`);
  console.log(`${rec.name}, ${rec.portions} portions\n`);
  const lines = Object.entries(rec.ingredients).map(([name, g]) => [name, g, food(name, g)]);
  lines.sort((a, b) => b[2].cost - a[2].cost);
  const total = recipeTotal(id);
  for (const [name, g, f] of lines) {
    console.log(`  ${name.padEnd(24)} ${String(g).padStart(5)} g  ${lei(f.cost).padStart(10)}  ${String(Math.round((100 * f.cost) / total.cost)).padStart(3)} % of the cost`);
  }
  console.log(`\n  Whole pot: ${summary(total)}`);
  console.log(`  Portion:   ${summary(perPortion(id))}`);
}

function showWeek(file) {
  const week = load(file).days;
  const w = zero();
  let n = 0;
  console.log('Day          cost       energy   protein  fiber   salt   fruit+veg');
  for (const [day, meals] of Object.entries(week)) {
    const d = zero();
    for (const meal of Object.values(meals)) {
      for (const [id, portions] of Object.entries(meal.recipes ?? {})) add(d, perPortion(id), portions);
      for (const [name, g] of Object.entries(meal.foods ?? {})) add(d, food(name, g));
    }
    add(w, d);
    n++;
    console.log(`${day.padEnd(11)}${lei(d.cost).padStart(10)}${String(Math.round(d.kcal)).padStart(8)} kcal${d.protein.toFixed(0).padStart(6)} g${d.fiber.toFixed(0).padStart(6)} g${d.salt.toFixed(1).padStart(6)} g${String(Math.round(d.fruitVeg)).padStart(8)} g`);
  }
  console.log(`\nWeek: ${lei(w.cost)} (${lei(w.cost / n)} a day, about ${Math.round((w.cost / n) * 30.4)} lei a month)`);
  console.log(`Daily average: ${Math.round(w.kcal / n)} kcal, ${Math.round(w.protein / n)} g protein, ${Math.round(w.fiber / n)} g fiber, ` +
    `${(w.salt / n).toFixed(1)} g salt, ${Math.round(w.fruitVeg / n)} g fruit and vegetables, saturated fat ${((900 * w.sat) / w.kcal).toFixed(1)} % of energy`);
  console.log(`Cost of 1000 kcal: ${lei((1000 * w.cost) / w.kcal)}`);
}

// The shopping list for a week: every recipe used, cooked as a whole or a half pot (halving works for
// most recipes), plus the extra foods. Left-over portions are for the freezer or the following days.
function showShopping(file) {
  const week = load(file).days;
  const used = {};
  const grams = {};
  const addGrams = (name, g) => { grams[name] = (grams[name] ?? 0) + g; };
  for (const meals of Object.values(week)) {
    for (const meal of Object.values(meals)) {
      for (const [id, portions] of Object.entries(meal.recipes ?? {})) used[id] = (used[id] ?? 0) + portions;
      for (const [name, g] of Object.entries(meal.foods ?? {})) addGrams(name, g);
    }
  }
  let spare = 0;
  console.log('Cook:');
  for (const [id, portions] of Object.entries(used)) {
    const rec = recipes[id];
    if (!rec) throw new Error(`no recipe "${id}" in recipes.json`);
    const pots = Math.ceil((2 * portions) / rec.portions) / 2;
    const left = pots * rec.portions - portions;
    spare += left * perPortion(id).cost;
    const potText = pots === 0.5 ? 'half a pot of' : `${pots} x`;
    console.log(`  ${potText} ${rec.name} (${pots * rec.portions} portion${pots * rec.portions === 1 ? "" : "s"}, ${portions} eaten${left ? `, ${left} left over` : ''})`);
    for (const [name, g] of Object.entries(rec.ingredients)) addGrams(name, g * pots);
  }
  console.log('\nBuy:');
  let total = 0;
  for (const [name, g] of Object.entries(grams).sort((a, b) => b[1] - a[1])) {
    const cost = (pantry[name].price * g) / 1000;
    total += cost;
    const amount = g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${Math.round(g)} g`;
    console.log(`  ${name.padEnd(24)} ${amount.padStart(9)}  ${lei(cost).padStart(10)}`);
  }
  console.log(`\nShopping: ${lei(total)}, of which about ${lei(spare)} is left-over portions.`);
  console.log('Soups, stews and cooked beans freeze well; eat left-over salads within 3-4 days.');
  console.log('Oil, salt and spices come in larger packages that last several weeks.');
}

try {
  const args = process.argv.slice(2);
  if (args[0] === '--week') showWeek(args[1] ?? path.join(here, 'week-menu.json'));
  else if (args[0] === '--shopping') showShopping(args[1] ?? path.join(here, 'week-menu.json'));
  else if (args[0]) showRecipe(args[0]);
  else listAll();
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exitCode = 1;
}
