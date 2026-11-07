# Common cryptographic mistakes

Strong algorithms are rarely what fails. Real systems break through **misuse** and **implementation flaws**. Each row below has broken real products.

| Mistake | Consequence | Do instead |
|---|---|---|
| Reusing a nonce with GCM, ChaCha20 or CTR | plaintext recovery (`aead.js`), and forgeries with GCM | counters, or XChaCha20 / AES-GCM-SIV |
| Reusing or biasing ECDSA nonces | private key recovery (`ecc-toy.js`; PS3, Bitcoin wallets) | RFC 6979 or Ed25519 |
| Encryption without authentication (CBC, CTR) | padding oracles, bit-flipping | an AEAD |
| ECB mode | patterns leak | an AEAD |
| Textbook RSA, or PKCS #1 v1.5 encryption | malleability, Bleichenbacher attacks | OAEP, or better, ECDH/KEM-based hybrid encryption |
| `==` to compare MACs and tokens | byte-by-byte timing leaks | constant-time comparison |
| `Math.random()` for keys or tokens | predictable secrets | a CSPRNG (`crypto.randomBytes`) |
| Fast hashes for passwords | billions of guesses per second | Argon2id or scrypt |
| `H(key ‖ msg)` as a MAC | length extension | HMAC |
| Hard-coded keys in source code or apps | anyone with the binary has the key | a secret manager, KMS or HSM |
| Disabling certificate checks ("just for testing") | silent man-in-the-middle | fix the trust store; never ship `rejectUnauthorized: false` |
| Unauthenticated Diffie-Hellman | man in the middle (`dh-toy.js`) | sign the exchange, or use certificates |
| Ambiguous encodings in signed data | two different meanings with one signature | length-prefixed or canonical encodings |
| Using one key for several purposes | cross-protocol attacks | derive separate keys with HKDF and distinct `info` |

## Side channels

The code can be mathematically perfect and still leak through **how** it runs:

- **Timing**: branches and memory accesses that depend on secrets. Lucky 13 recovered plaintext from timing differences in TLS's CBC padding checks, and cache-timing attacks recovered AES keys from table-based implementations.
- **Power and electromagnetic emissions**: smart cards and embedded devices.
- **Fault injection**: glitching a device during RSA-CRT signing can reveal a factor of $n$ from a single faulty signature (the Bellcore attack). One check fixes it: verify each signature before releasing it.

Constant-time code is a specialist skill. That's another reason to use vetted libraries rather than your own implementations, however good the math.

## Key management is most of the work

Algorithms are the easy part. Keys need:

- **generation** with a CSPRNG, in the right place (ideally inside an HSM or KMS that never exports them);
- **storage**: encrypted at rest, with access controls and audit logs;
- **rotation**, on a schedule and immediately after suspected compromise, so design for it from day one;
- **separation**: different keys for different purposes and environments;
- **destruction** when retired, together with any backups.

## A safe default toolbox

| Need | Use |
|---|---|
| Encrypt data | AES-256-GCM or (X)ChaCha20-Poly1305, through a high-level API (libsodium `secretbox`, Tink AEAD) |
| Hash | SHA-256, SHA-512, SHA-3 or BLAKE2/3 |
| MAC | HMAC-SHA256 |
| Passwords | Argon2id (scrypt or bcrypt if unavailable) |
| Key derivation | HKDF-SHA256 |
| Key exchange | X25519, moving to hybrid X25519MLKEM768 |
| Signatures | Ed25519 (ECDSA P-256 where required), planning for ML-DSA |
| Random numbers | the OS CSPRNG |
| Transport | TLS 1.3, using the platform's libraries and certificate validation |

When a high-level library offers "encrypt this for that recipient", use it rather than assembling primitives. The project assembles them only so that you can see the parts.
