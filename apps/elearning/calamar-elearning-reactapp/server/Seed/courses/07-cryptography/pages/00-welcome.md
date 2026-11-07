# Welcome to the course

Cryptography is what makes internet security possible. It keeps HTTPS private, makes passwords hard to crack, proves software updates authentic, and lets two strangers agree on a secret key in public. This advanced course explains **how it works, mathematically**, and how to use it without falling into the traps that have broken real systems.

## Prerequisites

- The *Internet Security Essentials* course, or equivalent familiarity with HTTPS, hashing and passwords.
- High-school algebra. The modular arithmetic is introduced from scratch.
- Some programming. The samples are Node.js scripts (Node 22+, no dependencies).

## What you will learn

1. **Foundations**: security goals and definitions, security levels in bits and the birthday bound, and modular arithmetic.
2. **Symmetric encryption**: block ciphers and modes, and authenticated encryption (AES-GCM, ChaCha20-Poly1305), including what happens when a nonce repeats.
3. **Hashes, MACs and key derivation**: collision resistance, HMAC, HKDF and password hashing.
4. **Public-key cryptography**: RSA, Diffie-Hellman, elliptic curves and digital signatures, each built from the math up, with toy implementations you can check by hand.
5. **Protocols**: the TLS 1.3 handshake and key schedule, and certificates.
6. **Post-quantum and pitfalls**: what quantum computers break, the new NIST standards, and the classic implementation mistakes.
7. **Project**: an authenticated, encrypted, forward-secret channel built from standard primitives.

## The sample files

| File | Shows |
|---|---|
| `modmath.js` | gcd, modular inverses, fast exponentiation, Miller-Rabin primality, CRT |
| `toy-rsa.js` | RSA from scratch, its three textbook weaknesses, and real RSA with OAEP and PSS |
| `dh-toy.js` | Diffie-Hellman by hand, at 2048 bits and with X25519, and the man in the middle |
| `ecc-toy.js` | elliptic-curve arithmetic on a 19-point curve, ECDH, ECDSA, and nonce-reuse key recovery |
| `aead.js` | AES-256-GCM and ChaCha20-Poly1305, tampering, and nonce reuse |
| `hashes.js` | the avalanche effect, birthday collisions on truncated hashes, and HMAC |
| `secure-channel.js` | the project: Ed25519 + X25519 + HKDF + AES-GCM |

## The golden rule

**Don't invent your own cryptography, and don't implement standard algorithms yourself for production use.** The toy implementations here exist to understand the math. They are slow, and leak secrets through timing. In real code, use vetted libraries (your platform's crypto, libsodium, Tink) at the highest level of abstraction they offer. The final chapter shows why, with examples.
