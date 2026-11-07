// ux-math.js: the small formulas behind common UX rules of thumb.
//
//   node ux-math.js     prints the examples worked in the lessons

/** Fitts's law (Shannon form): movement time to hit a target of width w at distance d. a, b fitted per device. */
export function fittsTime(d, w, a = 0.1, b = 0.15) {
  return a + b * Math.log2(d / w + 1);
}

/** Fitts's index of difficulty, in bits */
export const fittsID = (d, w) => Math.log2(d / w + 1);

/** Hick–Hyman law: time to choose among n equally likely options */
export function hickTime(n, a = 0.2, b = 0.15) {
  return a + b * Math.log2(n + 1);
}

/** Nielsen–Landauer: share of usability problems found by n test users, each finding a share `l` of them */
export function problemsFound(n, l = 0.31) {
  return 1 - (1 - l) ** n;
}

/** The System Usability Scale score (0..100) from the ten 1..5 answers, in questionnaire order */
export function susScore(answers) {
  if (answers.length !== 10) throw new Error('SUS has ten questions');
  const sum = answers.reduce((acc, x, i) => acc + (i % 2 === 0 ? x - 1 : 5 - x), 0);
  return sum * 2.5;
}

/** A modular type scale: size_n = base * ratio^n */
export function typeScale(base = 16, ratio = 1.25, from = -2, to = 5) {
  const out = {};
  for (let n = from; n <= to; n++) out[n] = +(base * ratio ** n).toFixed(2);
  return out;
}

/** Column width in a grid of n columns, gutter g and outer margin m, inside width W */
export const columnWidth = (W, n, g, m) => (W - 2 * m - (n - 1) * g) / n;

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/').replace(/^(?=[A-Za-z]:)/, '/')}`) {
  console.log('Fitts: 32px button 600px away  ', fittsTime(600, 32).toFixed(3), 's, ID', fittsID(600, 32).toFixed(2), 'bits');
  console.log('Fitts: 64px button 600px away  ', fittsTime(600, 64).toFixed(3), 's, ID', fittsID(600, 64).toFixed(2), 'bits');
  console.log('Hick: 4 vs 16 menu items       ', hickTime(4).toFixed(3), 's vs', hickTime(16).toFixed(3), 's');
  for (const n of [1, 3, 5, 10, 15]) console.log(`Nielsen: ${String(n).padStart(2)} users find`, (problemsFound(n) * 100).toFixed(1) + '%');
  console.log('SUS [4,2,5,1,4,2,5,2,4,1]       ', susScore([4, 2, 5, 1, 4, 2, 5, 2, 4, 1]));
  console.log('Type scale 16px x 1.25         ', typeScale());
  console.log('12 columns in 1200px, g=24 m=32', columnWidth(1200, 12, 24, 32).toFixed(2), 'px');
}
