# Security levels and the birthday bound

## Bits of security

A scheme has **$n$-bit security** if the best known attack needs about $2^n$ operations. Each extra bit doubles the attacker's work.

How big is $2^{128}$? Suppose an attacker could test $10^{18}$ keys per second, far beyond the combined output of the world's computers:

$$
\frac{2^{128}}{10^{18}\ \text{s}^{-1}} \approx \frac{3.4 \times 10^{38}}{10^{18}}\ \text{s} = 3.4 \times 10^{20}\ \text{s} \approx 1.1 \times 10^{13}\ \text{years}
$$

That's about 800 times the age of the universe. **128 bits is the standard target** today. Thermodynamics alone (the minimum energy to flip a bit) makes brute-forcing 256 bits physically impossible.

## Equivalent strengths

Different families need very different key sizes for the same security, because their best attacks differ (NIST SP 800-57):

| Security | Symmetric | Hash (collisions) | RSA and finite-field DH | Elliptic curves |
|---|---|---|---|---|
| 112 bits | (3DES, retired) | SHA-224 | 2048 | 224 |
| **128 bits** | **AES-128** | **SHA-256** | **3072** | **256** (P-256, Curve25519) |
| 192 bits | AES-192 | SHA-384 | 7680 | 384 |
| 256 bits | AES-256 | SHA-512 | 15360 | 512+ |

RSA needs huge keys because factoring has **sub-exponential** algorithms (the number field sieve). For well-chosen elliptic curves, the best known attacks (Pollard's rho) are exponential, about $\sqrt{n}$ steps for a group of order $n$, so a 256-bit curve gives 128-bit security.

## The birthday paradox

In a room of 23 people, there's a better than even chance that two share a birthday. With $q$ random values from $N$ possibilities, the probability that at least two are equal is

$$
\Pr[\text{collision}] = 1 - \prod_{i=1}^{q-1}\left(1 - \frac{i}{N}\right) \approx 1 - e^{-q(q-1)/(2N)} \approx \frac{q^2}{2N} \quad (q \ll \sqrt{N})
$$

The probability reaches $\tfrac{1}{2}$ around $q \approx 1.18\sqrt{N}$, and the **expected** number of draws until the first collision is

$$
\mathbb{E}[q] \approx \sqrt{\frac{\pi N}{2}}
$$

For birthdays, $N = 365$: $1.18\sqrt{365} \approx 22.5$.

## Why it matters

Collisions are found in about $\sqrt{N}$ work, not $N$:

- An $n$-bit hash has only **$n/2$-bit collision resistance**. SHA-256 gives 128 bits against collisions.
- `hashes.js` finds collisions of SHA-256 truncated to 16, 24 and 32 bits in milliseconds. For 32 bits, $N = 2^{32}$ and the expected number of tries is $\sqrt{\pi \cdot 2^{32} / 2} \approx 82{,}000$, versus about 4.3 billion for a preimage. (Any single run can land well above or below that expectation.)
- **Random nonces** collide the same way. With 96-bit nonces, after $q$ messages under one key, a repeat has probability about $q^2 / 2^{97}$. That's why NIST limits AES-GCM with random nonces to $2^{32}$ messages per key: $2^{64}/2^{97} = 2^{-33}$.
- **Block ciphers** with 64-bit blocks (3DES, Blowfish) leak plaintext after about $2^{32}$ blocks (32 GB), which the 2016 Sweet32 attack demonstrated on HTTPS. AES's 128-bit blocks push that to $2^{64}$ blocks.

Whenever a design depends on random values not repeating, compute the birthday bound.
