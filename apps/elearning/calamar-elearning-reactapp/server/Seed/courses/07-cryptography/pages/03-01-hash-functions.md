# Cryptographic hash functions

A hash function $H$ maps inputs of any length to a fixed-length digest, for example $\{0,1\}^* \to \{0,1\}^{256}$ for SHA-256. To be **cryptographic**, it must resist three attacks:

| Property | Hard to… | Generic attack cost ($n$-bit output) |
|---|---|---|
| **Preimage resistance** | given $y$, find any $x$ with $H(x) = y$ | $2^n$ |
| **Second-preimage resistance** | given $x$, find $x' \ne x$ with $H(x') = H(x)$ | $2^n$ |
| **Collision resistance** | find any $x \ne x'$ with $H(x) = H(x')$ | $2^{n/2}$ (the birthday bound) |

Collisions are the easiest to find, so they set the hash size: 256-bit hashes for 128-bit security.

## The avalanche effect

A good hash behaves like a random function: changing one input bit flips each output bit with probability $\tfrac{1}{2}$. From `hashes.js`:

```
SHA-256("…lazy dog") = d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592
SHA-256("…lazy cog") = e4c4d8f3bf76b692de791a173e05321150f7a345b46484fe427f6acc7ecc81be
bits that differ: 123 of 256 (expected about 128)
```

The number of differing bits follows a binomial distribution with mean $128$ and standard deviation $\sqrt{256 \cdot \tfrac{1}{4}} = 8$, so 123 is entirely typical.

## The families

| Hash | Construction | Status |
|---|---|---|
| MD5 | Merkle-Damgård, 128-bit | **broken**: collisions in seconds; used in the Flame malware's forged certificate (2012) |
| SHA-1 | Merkle-Damgård, 160-bit | **broken**: practical collision in 2017 (SHAttered), chosen-prefix collisions in 2020 |
| SHA-256, SHA-512 (SHA-2) | Merkle-Damgård | secure; the default choice |
| SHA3-256, SHAKE (SHA-3) | sponge (Keccak) | secure; a different design, as a backup |
| BLAKE2, BLAKE3 | ARX designs | secure and very fast |

**Merkle-Damgård** (MD5, SHA-1, SHA-2) pads the message, splits it into blocks, and chains a compression function $f$: $h_i = f(h_{i-1}, m_i)$, and the digest is the last $h$. This structure has a quirk: knowing $H(m)$ and the length of $m$, anyone can compute $H(m \,\|\, \text{pad} \,\|\, m')$ without knowing $m$. That's the **length-extension attack**, and it matters for MACs (next lesson). SHA-3's sponge construction, and the truncated variants SHA-512/256 and SHA-384, aren't affected.

## Uses, and misuses

Good uses:

- file and download integrity, when the digest comes over a trusted channel;
- content addressing (Git objects, container image digests);
- inside signatures (sign $H(m)$, not $m$), MACs (HMAC) and KDFs (HKDF);
- commitments: publish $H(\text{nonce} \,\|\, \text{value})$ now, and reveal it later.

Misuses:

- **Passwords**: fast hashes allow billions of guesses per second. Use Argon2id or scrypt (lesson 3).
- **MACs as $H(\text{key} \,\|\, m)$**: length extension. Use HMAC.
- **Truncating carelessly**: a 64-bit truncated digest has only 32-bit collision resistance. `hashes.js` finds 32-bit collisions in milliseconds.
- **MD5 or SHA-1 for anything security-related**, including certificates and signatures.
