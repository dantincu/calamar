// dh-toy.js: Diffie-Hellman key exchange, first with numbers small enough to check by hand, then for real (X25519).
//   node dh-toy.js
import crypto from 'node:crypto';
import { modPow, randomBetween } from '../math/modmath.js';

// ---- 1. By hand: p = 23, g = 5 --------------------------------------------------------------------------
{
  const p = 23n, g = 5n;
  const a = 6n, b = 15n;                      // Alice's and Bob's secrets
  const A = modPow(g, a, p);                  // 5^6 mod 23 = 8: sent in the clear
  const B = modPow(g, b, p);                  // 5^15 mod 23 = 19: sent in the clear
  const sAlice = modPow(B, a, p);             // 19^6 mod 23
  const sBob = modPow(A, b, p);               // 8^15 mod 23
  console.log(`Toy DH: p=${p}, g=${g}`);
  console.log(`  Alice sends A = g^a mod p = ${A}, Bob sends B = g^b mod p = ${B}`);
  console.log(`  Alice computes B^a mod p = ${sAlice}, Bob computes A^b mod p = ${sBob}: the same secret`);

  // An eavesdropper sees p, g, A and B. With p = 23, trying every exponent is instant:
  for (let x = 1n; x < p; x++) if (modPow(g, x, p) === A) { console.log(`  Eve finds a = ${x} by brute force: tiny groups are useless`); break; }
}

// ---- 2. A realistic group size, still by hand (RFC 3526 group 14: a 2048-bit safe prime) -----------------------
{
  const p = BigInt('0x' +
    'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
    'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
    'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
    '83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
    'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
    '15728E5A8AACAA68FFFFFFFFFFFFFFFF');
  const g = 2n;
  const a = randomBetween(2n, p - 2n), b = randomBetween(2n, p - 2n);
  const A = modPow(g, a, p), B = modPow(g, b, p);
  const same = modPow(B, a, p) === modPow(A, b, p);
  console.log(`\n2048-bit DH (RFC 3526 group 14): shared secret agreed? ${same}`);
  console.log('  Finding a from A now means solving a discrete logarithm modulo a 2048-bit prime: infeasible.');
}

// ---- 3. In practice: X25519 (elliptic-curve Diffie-Hellman), as in TLS 1.3, SSH, Signal, WireGuard -------------
{
  const alice = crypto.generateKeyPairSync('x25519');
  const bob = crypto.generateKeyPairSync('x25519');
  const s1 = crypto.diffieHellman({ privateKey: alice.privateKey, publicKey: bob.publicKey });
  const s2 = crypto.diffieHellman({ privateKey: bob.privateKey, publicKey: alice.publicKey });
  const rawPub = alice.publicKey.export({ format: 'jwk' }).x;
  console.log(`\nX25519: public keys are 32 bytes (Alice's: ${Buffer.from(rawPub, 'base64url').toString('hex').slice(0, 16)}…)`);
  console.log(`  shared secret agreed? ${s1.equals(s2)} (${s1.length} bytes)`);
  console.log('  Never use the raw shared secret as a key: derive keys from it with HKDF (see secure-channel.js).');
}

// ---- 4. The man in the middle -----------------------------------------------------------------------------
// Plain DH authenticates nobody: Mallory can run one exchange with Alice and another with Bob, and relay
// (and read) everything. That's why TLS signs the exchange with the server's certificate key.
{
  const alice = crypto.generateKeyPairSync('x25519');
  const bob = crypto.generateKeyPairSync('x25519');
  const mallory = crypto.generateKeyPairSync('x25519');
  const aliceThinksBob = crypto.diffieHellman({ privateKey: alice.privateKey, publicKey: mallory.publicKey });
  const malloryWithAlice = crypto.diffieHellman({ privateKey: mallory.privateKey, publicKey: alice.publicKey });
  const bobThinksAlice = crypto.diffieHellman({ privateKey: bob.privateKey, publicKey: mallory.publicKey });
  const malloryWithBob = crypto.diffieHellman({ privateKey: mallory.privateKey, publicKey: bob.publicKey });
  console.log('\nMan in the middle: Mallory shares a key with Alice?', aliceThinksBob.equals(malloryWithAlice),
    '/ with Bob?', bobThinksAlice.equals(malloryWithBob), '/ Alice and Bob share one?', aliceThinksBob.equals(bobThinksAlice));
}
