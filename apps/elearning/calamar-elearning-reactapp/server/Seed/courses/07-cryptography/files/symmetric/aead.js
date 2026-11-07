// aead.js: authenticated encryption with AES-256-GCM and ChaCha20-Poly1305, and what goes wrong when a nonce repeats.
//   node aead.js
import crypto from 'node:crypto';

/** encrypt: returns nonce | ciphertext | tag. The AAD is authenticated but not encrypted (headers, IDs, versions). */
function seal(alg, key, plaintext, aad, nonce = crypto.randomBytes(12)) {
  const opts = alg === 'chacha20-poly1305' ? { authTagLength: 16 } : undefined;
  const cipher = crypto.createCipheriv(alg, key, nonce, opts);
  cipher.setAAD(aad);
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([nonce, ct, cipher.getAuthTag()]);
}

/** decrypt and verify; throws if anything (nonce, ciphertext, tag or AAD) was changed */
function open(alg, key, box, aad) {
  const nonce = box.subarray(0, 12), tag = box.subarray(box.length - 16), ct = box.subarray(12, box.length - 16);
  const opts = alg === 'chacha20-poly1305' ? { authTagLength: 16 } : undefined;
  const decipher = crypto.createDecipheriv(alg, key, nonce, opts);
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);   // final() throws on a bad tag
}

const key = crypto.randomBytes(32);                    // 256-bit key
const aad = Buffer.from('msg-id=42;from=alice');

for (const alg of ['aes-256-gcm', 'chacha20-poly1305']) {
  const box = seal(alg, key, Buffer.from('Transfer 100 EUR to Bob'), aad);
  console.log(`${alg}: ${box.length} bytes = 12 nonce + 23 ciphertext + 16 tag`);
  console.log('  decrypts to:', open(alg, key, box, aad).toString());

  const tampered = Buffer.from(box);
  tampered[12 + 9] ^= 0x01;                          // flip one bit of the ciphertext
  try { open(alg, key, tampered, aad); } catch (e) { console.log('  one flipped bit  ->', e.message); }
  try { open(alg, key, box, Buffer.from('msg-id=43;from=alice')); } catch (e) { console.log('  changed AAD      ->', e.message); }
}

// ---- Why the nonce must never repeat (for a given key) ---------------------------------------------------------
// GCM encrypts with a keystream: C = P XOR KS(key, nonce). The same nonce gives the same keystream, so
// C1 XOR C2 = P1 XOR P2: the key cancels out. Knowing (or guessing) one plaintext reveals the other.
// (Repeating a GCM nonce also leaks the authentication key, which lets an attacker forge messages.)
const nonce = crypto.randomBytes(12);
const p1 = Buffer.from('Meet at the station at 10'), p2 = Buffer.from('The password is tiger-42!');
const c1 = seal('aes-256-gcm', key, p1, aad, nonce).subarray(12, 12 + p1.length);
const c2 = seal('aes-256-gcm', key, p2, aad, nonce).subarray(12, 12 + p2.length);
const xor = (x, y) => Buffer.from(x.map((v, i) => v ^ y[i]));
console.log('\nNonce reused. The attacker knows message 1, and computes C1 ^ C2 ^ P1:');
console.log('  ->', JSON.stringify(xor(xor(c1, c2), p1).toString()));

// ---- How many messages per key with random 96-bit nonces? -------------------------------------------------------
// Birthday bound: after q random nonces, P(some repeat) ≈ q^2 / 2^97. NIST limits random-nonce GCM to 2^32 messages
// per key, which keeps that probability below 2^-32.
for (const q of [2 ** 20, 2 ** 32, 2 ** 40]) {
  console.log(`  ${q.toExponential(2)} messages -> collision probability ≈ ${(q * q / 2 ** 97).toExponential(2)}`);
}
