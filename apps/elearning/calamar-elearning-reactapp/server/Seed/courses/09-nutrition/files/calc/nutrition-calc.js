// nutrition-calc.js: energy and nutrient targets for one adult, with the formulas from the course.
//
//   node nutrition-calc.js --sex f --age 30 --weight 65 --height 168 --activity moderate
//   node nutrition-calc.js --sex m --age 45 --weight 92 --height 180 --activity light --goal lose --waist 98
//
// Educational estimates for healthy adults, not medical advice. Pregnancy, breastfeeding, children,
// athletes in heavy training and anyone with a medical condition need individual advice.

const ACTIVITY = {
  sedentary: 1.2,   // desk job, little exercise
  light: 1.375,     // light exercise 1-3 days a week
  moderate: 1.55,   // moderate exercise 3-5 days a week
  active: 1.725,    // hard exercise 6-7 days a week
  very: 1.9,        // physical job plus training
};

// Mifflin-St Jeor (1990): resting energy expenditure in kcal/day.
// weight in kg, height in cm, age in years.
function bmr({ sex, age, weight, height }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'm' ? base + 5 : base - 161;
}

function tdee(person) {
  const factor = ACTIVITY[person.activity];
  if (!factor) throw new Error(`unknown activity "${person.activity}": use ${Object.keys(ACTIVITY).join(', ')}`);
  return bmr(person) * factor;
}

function bmi({ weight, height }) {
  const m = height / 100;
  return weight / (m * m);
}

function bmiClass(value) {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'healthy range';
  if (value < 30) return 'overweight';
  return 'obesity';
}

// The energy target for a goal. A deficit of about 500 kcal/day, never below 1.1 x BMR,
// is a common, sustainable starting point; "gain" adds 300 kcal/day.
function energyTarget(person) {
  const t = tdee(person);
  if (person.goal === 'lose') return Math.max(t - 500, 1.1 * bmr(person));
  if (person.goal === 'gain') return t + 300;
  return t;
}

// Daily targets. Ranges follow EFSA reference values and WHO guidelines.
function targets(person) {
  const kcal = energyTarget(person);
  const proteinPerKg = person.age >= 65 ? 1.0 : 0.83;      // EFSA PRI 0.83 g/kg; >= 1.0 g/kg advised for older adults
  return {
    kcal,
    protein: { min: proteinPerKg * person.weight, max: 2.0 * person.weight },   // g
    fat: { min: (0.20 * kcal) / 9, max: (0.35 * kcal) / 9 },                     // g, 20-35 % of energy
    saturatedFatMax: (0.10 * kcal) / 9,                                           // g, < 10 % of energy
    carbs: { min: (0.45 * kcal) / 4, max: (0.60 * kcal) / 4 },                   // g, 45-60 % of energy
    freeSugarsMax: (0.10 * kcal) / 4,                                             // g, < 10 % (ideally < 5 %)
    fiberMin: 25,                                                                 // g
    saltMax: 5,                                                                   // g (= 2 g sodium)
    fruitVegMin: 400,                                                             // g
    waterTotal: person.sex === 'm' ? 2.5 : 2.0,                                   // L, from drinks and food
  };
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, '')] = argv[i + 1];
  const person = {
    sex: a.sex === 'm' ? 'm' : 'f',
    age: Number(a.age ?? 30),
    weight: Number(a.weight ?? 65),
    height: Number(a.height ?? 168),
    activity: a.activity ?? 'moderate',
    goal: a.goal ?? 'maintain',
    waist: a.waist ? Number(a.waist) : undefined,
  };
  for (const k of ['age', 'weight', 'height']) {
    if (!Number.isFinite(person[k]) || person[k] <= 0) throw new Error(`--${k} must be a positive number`);
  }
  if (person.age < 18) throw new Error('these formulas are for adults (18+)');
  return person;
}

function main() {
  const p = parseArgs(process.argv.slice(2));
  const r = (x) => Math.round(x);
  const b = bmi(p);
  const t = targets(p);
  console.log(`Person: ${p.sex === 'm' ? 'male' : 'female'}, ${p.age} y, ${p.weight} kg, ${p.height} cm, ${p.activity}, goal: ${p.goal}`);
  console.log(`BMI              ${b.toFixed(1)} kg/m2 (${bmiClass(b)})`);
  if (p.waist) {
    const whtr = p.waist / p.height;
    console.log(`Waist-to-height  ${whtr.toFixed(2)} (${whtr < 0.5 ? 'below 0.5: no increased risk' : '0.5 or more: increased risk'})`);
  }
  console.log(`BMR              ${r(bmr(p))} kcal/day (Mifflin-St Jeor)`);
  console.log(`TDEE             ${r(tdee(p))} kcal/day (x ${ACTIVITY[p.activity]})`);
  console.log(`Energy target    ${r(t.kcal)} kcal/day`);
  console.log(`Protein          ${r(t.protein.min)}-${r(t.protein.max)} g`);
  console.log(`Fat              ${r(t.fat.min)}-${r(t.fat.max)} g, of which saturated < ${r(t.saturatedFatMax)} g`);
  console.log(`Carbohydrates    ${r(t.carbs.min)}-${r(t.carbs.max)} g, of which free sugars < ${r(t.freeSugarsMax)} g`);
  console.log(`Fiber            >= ${t.fiberMin} g`);
  console.log(`Salt             < ${t.saltMax} g`);
  console.log(`Fruit and veg    >= ${t.fruitVegMin} g`);
  console.log(`Water            about ${t.waterTotal} L in total (about 80 % from drinks)`);
}

module.exports = { ACTIVITY, bmr, tdee, bmi, bmiClass, energyTarget, targets };

if (require.main === module) {
  try { main(); } catch (e) { console.error(`error: ${e.message}`); process.exitCode = 1; }
}
