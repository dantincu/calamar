// weight-change.js: why "7700 kcal = 1 kg" overpromises.
//
//   node weight-change.js --deficit 500            # eat 500 kcal/day less, starting tomorrow
//   node weight-change.js --deficit 250 --years 4
//
// Two predictions for a sustained change of the daily energy intake (deficit > 0 means eating less):
//
//  1. The static rule: every 7700 kcal of deficit removes 1 kg, forever, in a straight line.
//  2. The dynamic rule of thumb (Hall et al., Lancet 2011): every 10 kcal/day of sustained change
//     moves the body weight by about 0.45 kg in the end, half of it in about a year and 95 % in
//     about three. Weight levels off because a lighter body burns less energy.
//
// Both are population averages for adults; individuals differ, and this is not medical advice.

const KCAL_PER_KG = 7700;
const KG_PER_KCAL_DAY = 0.45 / 10;       // eventual kg per kcal/day of sustained change
const HALF_LIFE_DAYS = 365;              // half of the eventual change after about one year
const TAU = HALF_LIFE_DAYS / Math.LN2;   // time constant of the exponential, in days

function staticLoss(deficit, days) {
  return (deficit * days) / KCAL_PER_KG;
}

function dynamicLoss(deficit, days) {
  return deficit * KG_PER_KCAL_DAY * (1 - Math.exp(-days / TAU));
}

function main() {
  const a = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) a[argv[i].replace(/^--/, '')] = Number(argv[i + 1]);
  const deficit = a.deficit ?? 500;
  const years = a.years ?? 3;

  console.log(`Sustained deficit: ${deficit} kcal/day`);
  console.log(`Eventual change (dynamic): ${(deficit * KG_PER_KCAL_DAY).toFixed(1)} kg\n`);
  console.log('After       7700-kcal rule   dynamic rule');
  const points = [30, 91, 182, 365];
  for (let y = 2; y <= years; y++) points.push(365 * y);
  for (const d of points) {
    const label = d < 365 ? `${Math.round(d / 30.4)} months` : `${d / 365} year${d > 365 ? 's' : ''}`;
    console.log(`${label.padEnd(12)}${staticLoss(deficit, d).toFixed(1).padStart(8)} kg${dynamicLoss(deficit, d).toFixed(1).padStart(13)} kg`);
  }
}

module.exports = { staticLoss, dynamicLoss };

if (require.main === module) main();
