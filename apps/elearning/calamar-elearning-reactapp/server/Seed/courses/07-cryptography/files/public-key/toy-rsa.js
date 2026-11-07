// toy-rsa.js: RSA from scratch with BigInt, to see the math work, and why "textbook RSA" is insecure.
//   node toy-rsa.js
// NEVER use this for real data: no padding, no side-channel protection. The end of the file shows real RSA.
import crypto from 'node:crypto';
import { gcd, modInverse, modPow, randomPrime } from '../math/modmath.js';

// ---- Key generation ------------------------------------------------------------------------------------
function generateKeys(bits = 1024) {
  const e = 65537n;
  for (;;) {
    const p = randomPrime(bits / 2);
    const q = randomPrime(bits / 2);
    if (p === q) continue;
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);          // Euler's totient of n
    if (gcd(e, phi) !== 1n) continue;          // e must be invertible modulo phi
    const d = modInverse(e, phi);              // e*d ≡ 1 (mod phi)
    return { n, e, d, p, q };
  }
}

const t = performance.now();
const key = generateKeys(1024);
console.log(`1024-bit key generated in ${(performance.now() - t).toFixed(0)} ms`);
console.log(`  n has ${key.n.toString(2).length} bits, e = ${key.e}, d has ${key.d.toString(2).length} bits`);

// ---- Encrypt and decrypt: c = m^e mod n, m = c^d mod n ----------------------------------------------------
const toInt = (s) => BigInt('0x' + Buffer.from(s, 'utf8').toString('hex'));
const toStr = (m) => Buffer.from(m.toString(16).padStart(2, '0').replace(/^(.(..)*)$/, '0$1'), 'hex').toString('utf8');

const m = toInt('Attack at dawn');
const c = modPow(m, key.e, key.n);
const back = modPow(c, key.d, key.n);
console.log('\nmessage   :', toStr(m));
console.log('ciphertext:', c.toString(16).slice(0, 48) + '…');
console.log('decrypted :', toStr(back));

// ---- Sign and verify: s = h^d mod n, check s^e mod n = h --------------------------------------------------------
const h = BigInt('0x' + crypto.createHash('sha256').update('I owe Bob 10 EUR').digest('hex'));
const sig = modPow(h, key.d, key.n);
console.log('\nsignature valid?             ', modPow(sig, key.e, key.n) === h);
const h2 = BigInt('0x' + crypto.createHash('sha256').update('I owe Bob 1000 EUR').digest('hex'));
console.log('same signature, other message?', modPow(sig, key.e, key.n) === h2);

// ---- Why textbook RSA is insecure ----------------------------------------------------------------------------
// 1. Deterministic: the same message always gives the same ciphertext, so an attacker can test guesses.
const guess = modPow(toInt('Attack at dawn'), key.e, key.n);
console.log('\n1. guess "Attack at dawn" and compare ciphertexts:', guess === c ? 'MATCH (the message is revealed)' : 'no match');

// 2. Malleable: E(a) * E(b) = E(a*b). An attacker can change a ciphertext predictably without the key.
const a = 1000n, b = 3n;
const product = (modPow(a, key.e, key.n) * modPow(b, key.e, key.n)) % key.n;
console.log('2. E(1000) * E(3) decrypts to', modPow(product, key.d, key.n), '(an "amount" multiplied without the key)');

// 3. Small messages with a small e: if m^e < n, then c = m^e exactly, and the e-th root of c gives m.
const tiny = 42n;
const c3 = modPow(tiny, 3n, key.n);     // with e = 3
console.log('3. with e = 3, the ciphertext of 42 is', c3, '= 42^3: no modular reduction happened at all');

// ---- Real RSA: random padding (OAEP for encryption, PSS for signatures) ----------------------------------------------
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 3072 });
const msg = Buffer.from('Attack at dawn');
const enc1 = crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, msg);
const enc2 = crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, msg);
console.log('\nOAEP: same message encrypted twice gives different ciphertexts?', !enc1.equals(enc2));
console.log('OAEP decrypts to:', crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, enc1).toString());
const pss = crypto.sign('sha256', msg, { key: privateKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING });
console.log('PSS signature valid?', crypto.verify('sha256', msg, { key: publicKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING }, pss));
