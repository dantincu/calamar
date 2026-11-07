// password-strength.js: entropy of RANDOMLY generated passwords and passphrases, and how long guessing takes.
//   node password-strength.js
//
// Entropy only applies to secrets chosen at random. A human-chosen "P@ssw0rd2026!" has far less real entropy
// than its length suggests, because attackers try such patterns first.
import { randomInt } from 'node:crypto';

/** bits of entropy of a secret of `length` symbols drawn uniformly from `alphabetSize` symbols: L * log2(N) */
const entropyBits = (alphabetSize, length) => length * Math.log2(alphabetSize);

/** expected time to guess: half the space, at `rate` guesses per second */
function crackTime(bits, rate) {
  const seconds = 2 ** (bits - 1) / rate;
  const units = [['years', 31_557_600], ['days', 86_400], ['hours', 3600], ['minutes', 60], ['seconds', 1]];
  for (const [name, size] of units) if (seconds >= size) return `${(seconds / size).toPrecision(3)} ${name}`;
  return `${seconds.toPrecision(3)} seconds`;
}

function randomPassword(length, alphabet) {
  return Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
}

// A tiny word list for the demo. Real generators use the EFF large list: 7776 words, 12.9 bits per word.
const WORDS = ('apple brick cloud dance eagle flame grape house image juice knife lemon magic noble ocean piano ' +
  'queen river stone tiger umbra voice whale xenon yacht zebra amber blaze coral delta ember frost ' +
  'glide honey ivory jolly karma lunar maple nectar orbit pearl quartz radar solar tulip unity vivid ' +
  'wagon pixel yodel zesty acorn bison cedar dune elbow fable gecko hazel inlet jumbo kiosk lilac').split(' ');

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALNUM = LOWER + LOWER.toUpperCase() + '0123456789';
const PRINTABLE = ALNUM + '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

const cases = [
  ['8 lowercase letters', 26, 8, () => randomPassword(8, LOWER)],
  ['8 printable ASCII characters', 95, 8, () => randomPassword(8, PRINTABLE)],
  ['12 letters and digits', 62, 12, () => randomPassword(12, ALNUM)],
  ['16 letters and digits', 62, 16, () => randomPassword(16, ALNUM)],
  [`4 words from ${WORDS.length}`, WORDS.length, 4, () => Array.from({ length: 4 }, () => WORDS[randomInt(WORDS.length)]).join('-')],
  ['6 words from the EFF list (7776)', 7776, 6, null],
];

console.log('Guess rates: online, rate-limited ~ 10/s; offline fast hash on GPUs ~ 1e11/s; offline Argon2id ~ 1e4/s\n');
for (const [label, n, len, gen] of cases) {
  const bits = entropyBits(n, len);
  console.log(`${label.padEnd(34)} ${bits.toFixed(1).padStart(5)} bits  e.g. ${gen ? gen() : '(use a real list)'}`);
  console.log(`${''.padEnd(34)} fast hash: ${crackTime(bits, 1e11).padEnd(18)} Argon2id: ${crackTime(bits, 1e4).padEnd(18)} online: ${crackTime(bits, 10)}`);
}
