# Post-quantum cryptography

## What a quantum computer would break

**Shor's algorithm** (1994) finds the period of a function efficiently on a quantum computer. That period-finding solves **factoring and discrete logarithms**, in finite fields and on elliptic curves alike, in polynomial time. So a large, error-corrected quantum computer would break:

- RSA (encryption and signatures);
- finite-field Diffie-Hellman, ECDH, X25519;
- ECDSA, Ed25519.

**Grover's algorithm** speeds up brute-force search quadratically: searching $N$ keys takes about $\sqrt{N}$ quantum steps. That turns AES-128's $2^{128}$ into roughly $2^{64}$, ignoring Grover's large practical overheads. The remedy is easy: **AES-256** keeps 128-bit security. SHA-256 and SHA-384 stay fine for most purposes.

| | Classical | Quantum |
|---|---|---|
| RSA-3072, ECC P-256 | 128-bit | **broken** (polynomial time) |
| AES-128 | 128-bit | about 64-bit (Grover) |
| AES-256 | 256-bit | about 128-bit |

Nobody knows when a cryptographically relevant quantum computer will exist. Estimates of the qubits needed to factor RSA-2048 keep falling, and experts' timelines range from about a decade to never. But there's a reason to act now:

## Harvest now, decrypt later

An adversary can **record encrypted traffic today**, and decrypt it once a quantum computer exists. Data that must stay secret for 10+ years (health records, state secrets, long-lived intellectual property) is already at risk if it's protected only by classical key exchange. Signatures are less urgent: a forged signature in the future doesn't break today's authentication. But long-lived roots of trust (firmware signing keys, root CAs) need planning now.

## The NIST standards (August 2024)

After an open competition that started in 2016:

| Standard | Based on | Type | Replaces |
|---|---|---|---|
| **FIPS 203: ML-KEM** (Kyber) | module lattices | key encapsulation | (EC)DH key exchange |
| **FIPS 204: ML-DSA** (Dilithium) | module lattices | signature | RSA and ECDSA signatures |
| **FIPS 205: SLH-DSA** (SPHINCS+) | hash functions only | signature | a conservative backup to ML-DSA |

FN-DSA (Falcon, compact lattice signatures) is in the standardization pipeline, and HQC (code-based) was selected in 2025 as a backup KEM built on a different mathematical problem.

## Learning with errors, in one formula

Lattice schemes rest on problems like **learning with errors** (LWE). Given a random matrix $A$ and

$$
\mathbf{b} = A\mathbf{s} + \mathbf{e} \pmod q
$$

where $\mathbf{s}$ is secret and $\mathbf{e}$ is a vector of **small random errors**, recover $\mathbf{s}$. Without $\mathbf{e}$, it's linear algebra: Gaussian elimination solves it instantly. With the errors, the problem becomes finding a close vector in a high-dimensional lattice, for which no efficient classical or quantum algorithm is known. ML-KEM uses a structured ("module") version for efficiency.

## The cost: size

| | Public key | Ciphertext / signature |
|---|---|---|
| X25519 | 32 B | 32 B |
| **ML-KEM-768** | 1,184 B | 1,088 B |
| Ed25519 | 32 B | 64 B |
| **ML-DSA-65** | 1,952 B | 3,309 B |
| SLH-DSA-128s | 32 B | 7,856 B |

The new schemes are fast, but much bigger. That matters for TLS handshakes, certificates (whole chains of ML-DSA signatures), and constrained devices.

## Migration: hybrids and crypto-agility

- **Hybrid key exchange**: combine classical and post-quantum algorithms, so the result is secure if either one holds. **X25519MLKEM768** is already the default in major browsers and CDNs (you saw it in `check-tls.js`). OpenSSH defaults to a hybrid as well.
- **Inventory**: find where you use RSA and ECC: TLS, VPNs, SSH, code signing, document signing, stored encrypted data, hardware tokens.
- **Crypto-agility**: design systems so that algorithms can be swapped through configuration (algorithm identifiers, versioned formats), not rewrites.
- Follow the official timelines: NIST plans to deprecate quantum-vulnerable public-key algorithms by 2030 and disallow them by 2035.
