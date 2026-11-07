# Goals, Kerckhoffs's principle and perfect secrecy

## What cryptography provides

| Goal | Primitive |
|---|---|
| **Confidentiality** | encryption (symmetric: AES, ChaCha20; public-key: RSA-OAEP, ECIES, ML-KEM) |
| **Integrity and authenticity** | MACs (HMAC, Poly1305), authenticated encryption, digital signatures |
| **Non-repudiation** | digital signatures (only the private-key holder could have signed) |
| **Key agreement** | Diffie-Hellman, ECDH, KEMs |

## Kerckhoffs's principle

> A cryptosystem should be secure even if everything about it, except the key, is public.

(Auguste Kerckhoffs, 1883; Shannon put it as "the enemy knows the system".) Algorithms are published and analyzed by the whole research community for years. AES, SHA-3 and the post-quantum standards all came out of open competitions. **Secrecy lives in the key**, which is short, random and replaceable. Secret algorithms ("security through obscurity") tend to break as soon as someone reverse-engineers them.

## Perfect secrecy: the one-time pad

Encrypt a message $m$ with a **truly random** key $k$ of the same length, used once:

$$
c = m \oplus k, \qquad m = c \oplus k
$$

Shannon proved (1949) that this has **perfect secrecy**: the ciphertext reveals nothing about the message. For every message $m$ and ciphertext $c$,

$$
\Pr[M = m \mid C = c] = \Pr[M = m]
$$

The reason: for any $c$ and any candidate $m'$ of the same length, there's exactly one key, $k' = c \oplus m'$, that would produce it, and every key is equally likely.

He also proved the catch: perfect secrecy **requires a key at least as long as all the messages it protects**, and the key must never be reused. Reuse gives $c_1 \oplus c_2 = m_1 \oplus m_2$, and the key cancels out. That was exactly the mistake exploited in the Venona project against reused Soviet pads. (`aead.js` shows the same leak in AES-GCM with a repeated nonce.)

## Computational security

Modern cryptography accepts a weaker, practical goal: **no efficient attacker can break the scheme with more than negligible probability**. "Efficient" means far less work than, say, $2^{128}$ operations.

The standard definition for encryption is **indistinguishability**: an attacker picks two messages $m_0$ and $m_1$, receives the encryption of one of them, chosen at random, and must guess which one. The scheme is secure if no efficient attacker guesses right with probability noticeably better than $\tfrac{1}{2}$:

$$
\left| \Pr[\text{correct guess}] - \tfrac{1}{2} \right| \le \varepsilon \quad \text{(negligible)}
$$

- **IND-CPA** (chosen-plaintext attack): the attacker can also get encryptions of messages of their choice. One immediate consequence: **encryption must be randomized**. If encrypting the same message twice gave the same ciphertext, the attacker would just encrypt $m_0$ and compare. That is the first textbook-RSA weakness in `toy-rsa.js`.
- **IND-CCA2** (adaptive chosen-ciphertext attack): the attacker can also get decryptions of any ciphertext except the challenge. It requires **non-malleability**, which authenticated encryption and RSA-OAEP provide, and textbook RSA does not.

These definitions sound academic, but each one rules out a family of real attacks.
