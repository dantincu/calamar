// password-storage.js: storing and checking passwords the right way.
//   node password-storage.js
//
// Rules: never store passwords, not even encrypted. Store a SLOW, SALTED hash, made by a password hashing
// function (Argon2id, scrypt, bcrypt), and compare in constant time.
import crypto from 'node:crypto';

// ---- scrypt (in Node for years) -------------------------------------------------------------------
// N = 2^17 work factor, r = 8, p = 1: about 128 MiB of memory per hash (128 * N * r bytes), which makes
// GPU and ASIC cracking expensive. maxmem must be raised above the default (32 MiB) to allow it.
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

function hashScrypt(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.normalize('NFKC'), salt, 32, SCRYPT);
  // Store the parameters with the hash, so they can be raised later without breaking old hashes
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyScrypt(password, stored) {
  const [alg, N, r, p, saltB64, hashB64] = stored.split('$');
  if (alg !== 'scrypt') throw new Error('unknown format');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length,
    { N: Number(N), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
  // timingSafeEqual takes the same time wherever the first difference is, so response times reveal nothing
  return crypto.timingSafeEqual(actual, expected);
}

// ---- Argon2id (the current first choice; built into Node 24.7+) -------------------------------------
function hashArgon2(password) {
  if (typeof crypto.argon2Sync !== 'function') return null;
  const nonce = crypto.randomBytes(16);           // Node calls the salt "nonce"
  const params = { memory: 65536, passes: 3, parallelism: 1, tagLength: 32 };   // memory in KiB: 64 MiB
  const tag = crypto.argon2Sync('argon2id', { message: password.normalize('NFKC'), nonce, ...params });
  return { nonce, params, tag };
}

function time(label, fn) {
  const t = performance.now();
  const result = fn();
  console.log(`${label.padEnd(36)} ${(performance.now() - t).toFixed(0).padStart(5)} ms`);
  return result;
}

const stored = time('scrypt hash (N=2^17)', () => hashScrypt('correct horse battery staple'));
console.log('  stored as:', stored);
console.log('  right password ->', time('scrypt verify', () => verifyScrypt('correct horse battery staple', stored)));
console.log('  wrong password ->', verifyScrypt('Correct horse battery staple', stored));

const a = time('Argon2id hash (64 MiB, 3 passes)', () => hashArgon2('correct horse battery staple'));
if (a) console.log('  tag:', a.tag.toString('base64'));
else console.log('  (this Node version has no crypto.argon2Sync; use the argon2 npm package)');

// ---- Why not a fast hash? ----------------------------------------------------------------------------
const n = 200_000;
const t0 = performance.now();
for (let i = 0; i < n; i++) crypto.createHash('sha256').update(`guess${i}`).digest();
const perSecond = n / ((performance.now() - t0) / 1000);
console.log(`\nSHA-256 on this CPU: ~${Math.round(perSecond).toLocaleString('en-US')} guesses per second (a GPU does billions).`);
console.log('scrypt above: a handful per second per core. That ratio is the protection.');
