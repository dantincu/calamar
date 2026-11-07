// unit-price.js: compare packages by their price per kg, and foods by what you get for your money.
//
//   node unit-price.js "Linte 500 g" 5.49 500 "Linte 1 kg" 9.99 1000 "Linte 400 g, oferta" 3.99 400
//   node unit-price.js --rank             # foods in pantry-bucharest.json: lei per 20 g protein, per 1000 kcal, per 10 g fiber
//   node unit-price.js --rank --all       # the same, for every food
//
// For the comparison, give a name, the price in lei and the net weight in grams for each package
// (for canned food, the drained weight: "masa netă după scurgere").

const fs = require('fs');
const path = require('path');

function compare(args) {
  if (args.length === 0 || args.length % 3 !== 0) {
    throw new Error('give packages as triples: "name" price grams');
  }
  const rows = [];
  for (let i = 0; i < args.length; i += 3) {
    const [name, price, grams] = [args[i], Number(args[i + 1]), Number(args[i + 2])];
    if (!(price > 0) || !(grams > 0)) throw new Error(`"${name}": price and grams must be positive numbers`);
    rows.push({ name, price, grams, perKg: (1000 * price) / grams });
  }
  rows.sort((a, b) => a.perKg - b.perKg);
  const best = rows[0].perKg;
  for (const r of rows) {
    const extra = r.perKg === best ? 'cheapest' : `+${Math.round((100 * (r.perKg - best)) / best)} %`;
    console.log(`${r.name.padEnd(28)} ${r.price.toFixed(2).padStart(7)} lei / ${String(r.grams).padStart(5)} g = ${r.perKg.toFixed(2).padStart(7)} lei/kg  ${extra}`);
  }
}

// Cost of a nutrient: price / (amount per kg as bought), with the edible fraction.
//   lei per 20 g protein = 20 * price / (10 * protein * yield)
//   lei per 1000 kcal    = 1000 * price / (10 * kcal * yield)
function rank(all) {
  const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'pantry-bucharest.json'), 'utf8')).items;
  const rows = Object.entries(items)
    .filter(([, f]) => f.kcal > 0)
    .map(([name, f]) => ({
      name,
      protein: f.protein > 0 ? (20 * f.price) / (10 * f.protein * f.yield) : Infinity,
      energy: (1000 * f.price) / (10 * f.kcal * f.yield),
      fiber: f.fiber > 0 ? (10 * f.price) / (10 * f.fiber * f.yield) : Infinity,
    }));
  const show = (title, key, unit) => {
    const n = all ? rows.length : 12;
    console.log(`\n${title}`);
    for (const r of [...rows].sort((a, b) => a[key] - b[key]).slice(0, n).filter((r) => r[key] !== Infinity)) {
      console.log(`  ${r[key].toFixed(2).padStart(6)} lei  ${r.name}`);
    }
    console.log(`  (${unit})`);
  };
  show('Cheapest protein: lei for 20 g of protein (a portion\'s worth)', 'protein', 'price only: grains are cheap protein but low in lysine; combine them with legumes');
  show('Cheapest energy: lei for 1000 kcal', 'energy', 'half of a day\'s energy for most adults');
  show('Cheapest fiber: lei for 10 g of fiber', 'fiber', 'the day\'s target is 25 g');
}

try {
  const args = process.argv.slice(2);
  if (args[0] === '--rank') rank(args[1] === '--all'); else compare(args);
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exitCode = 1;
}
