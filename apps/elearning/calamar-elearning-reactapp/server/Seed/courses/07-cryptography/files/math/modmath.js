// modmath.js: the modular arithmetic behind public-key cryptography, with BigInt.
//   node modmath.js                 # runs the examples
//   import { modPow, modInverse, isProbablePrime } from './modmath.js';
import { randomBytes } from 'node:crypto';

/** a mod m, always in [0, m) (JavaScript's % can return negative numbers) */
export const mod = (a, m) => ((a % m) + m) % m;

/** greatest common divisor, by Euclid's algorithm: gcd(a, b) = gcd(b, a mod b) */
export function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

/** extended Euclid: returns [g, x, y] with a*x + b*y = g = gcd(a, b) */
export function egcd(a, b) {
  let [oldR, r] = [a, b];
  let [oldX, x] = [1n, 0n];
  let [oldY, y] = [0n, 1n];
  while (r !== 0n) {
    const q = oldR / r;                      // BigInt division truncates
    [oldR, r] = [r, oldR - q * r];
    [oldX, x] = [x, oldX - q * x];
    [oldY, y] = [y, oldY - q * y];
  }
  return [oldR, oldX, oldY];
}

/** the inverse of a modulo m: the x with a*x ≡ 1 (mod m); exists only when gcd(a, m) = 1 */
export function modInverse(a, m) {
  const [g, x] = egcd(mod(a, m), m);
  if (g !== 1n) throw new Error(`${a} has no inverse modulo ${m} (gcd = ${g})`);
  return mod(x, m);
}

/** base^exp mod m by square-and-multiply: about log2(exp) squarings instead of exp multiplications */
export function modPow(base, exp, m) {
  if (m === 1n) return 0n;
  let result = 1n;
  base = mod(base, m);
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % m;
    base = (base * base) % m;
    exp >>= 1n;
  }
  return result;
}

/** a uniformly random BigInt with exactly `bits` bits */
export function randomBits(bits) {
  const bytes = randomBytes(Math.ceil(bits / 8));
  let n = BigInt('0x' + bytes.toString('hex'));
  n &= (1n << BigInt(bits)) - 1n;
  return n | (1n << BigInt(bits - 1));      // force the top bit, so it really has `bits` bits
}

/** a random BigInt in [lo, hi) */
export function randomBetween(lo, hi) {
  const range = hi - lo;
  const bits = range.toString(2).length;
  let r;
  do r = BigInt('0x' + randomBytes(Math.ceil(bits / 8) + 1).toString('hex')) % (1n << BigInt(bits));
  while (r >= range);                       // rejection sampling: no modulo bias
  return lo + r;
}

const SMALL_PRIMES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n];

/**
 * Miller-Rabin probabilistic primality test. A composite passes one round with probability at most 1/4,
 * so after `rounds` rounds the error probability is at most 4^-rounds (2^-80 for 40 rounds).
 */
export function isProbablePrime(n, rounds = 40) {
  if (n < 2n) return false;
  for (const p of SMALL_PRIMES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  // write n - 1 = 2^s * d with d odd
  let d = n - 1n, s = 0n;
  while ((d & 1n) === 0n) { d >>= 1n; s++; }
  witness: for (let i = 0; i < rounds; i++) {
    const a = randomBetween(2n, n - 2n);
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) continue witness;
    }
    return false;                           // a proves that n is composite
  }
  return true;
}

/** a random probable prime with exactly `bits` bits */
export function randomPrime(bits) {
  for (;;) {
    const candidate = randomBits(bits) | 1n;   // odd
    if (isProbablePrime(candidate)) return candidate;
  }
}

/** Chinese remainder theorem for two coprime moduli: the x mod m1*m2 with x ≡ a1 (mod m1), x ≡ a2 (mod m2) */
export function crt(a1, m1, a2, m2) {
  const m = m1 * m2;
  return mod(a1 * m2 * modInverse(m2, m1) + a2 * m1 * modInverse(m1, m2), m);
}

// ---- Examples ---------------------------------------------------------------------------------------
if (process.argv[1]?.endsWith('modmath.js')) {
  console.log('gcd(240, 46) =', gcd(240n, 46n));
  const [g, x, y] = egcd(240n, 46n);
  console.log(`egcd: 240*(${x}) + 46*(${y}) = ${240n * x + 46n * y} = gcd ${g}`);
  console.log('inverse of 3 mod 11 =', modInverse(3n, 11n), ' check: 3*4 mod 11 =', (3n * 4n) % 11n);
  console.log('7^560 mod 561 =', modPow(7n, 560n, 561n), ' (561 = 3*11*17 is a Carmichael number: it fools Fermat\'s test)');
  console.log('Miller-Rabin says 561 is prime?', isProbablePrime(561n));
  console.log("Fermat's little theorem, 5^(13-1) mod 13 =", modPow(5n, 12n, 13n));
  console.log('CRT: x ≡ 2 (mod 3), x ≡ 3 (mod 5)  ->  x =', crt(2n, 3n, 3n, 5n));
  const t = performance.now();
  const p = randomPrime(512);
  console.log(`a random 512-bit prime (${(performance.now() - t).toFixed(0)} ms):\n  ${p}`);
}
