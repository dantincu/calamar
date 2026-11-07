# Digital signatures

A digital signature proves that a message was approved by the holder of a private key, and that it wasn't changed. Anyone can verify it with the public key:

$$
\sigma = \operatorname{Sign}(sk, m), \qquad \operatorname{Verify}(pk, m, \sigma) \in \{\text{true}, \text{false}\}
$$

The security goal is **existential unforgeability under chosen-message attack** (EUF-CMA): even after obtaining signatures on messages of their choice, an attacker can't produce a valid signature on any new message.

Signatures protect software updates, TLS certificates and handshakes, code signing, Git commits, passkeys and cryptocurrency transactions.

## ECDSA

With a curve, generator $G$ of prime order $n$, private key $d$ and public key $Q = dG$. To sign a message with hash $z$:

1. pick a secret, uniformly random **nonce** $k \in [1, n-1]$;
2. compute $r = (kG)_x \bmod n$;
3. compute $s = k^{-1}(z + r d) \bmod n$.

The signature is $(r, s)$. To verify, compute

$$
w = s^{-1}, \quad u_1 = z w, \quad u_2 = r w \pmod n, \qquad \text{and check } (u_1 G + u_2 Q)_x \equiv r \pmod n
$$

It works because $u_1 G + u_2 Q = (z w + r w d)\,G = w\,(z + r d)\,G = k\,G$, since $w = s^{-1} = k\,(z + rd)^{-1}$.

## The nonce must be secret, unique and unbiased

Suppose two signatures used the same $k$. They have the same $r$, which is easy to spot. Subtracting the two equations for $s$:

$$
s_1 - s_2 = k^{-1}(z_1 - z_2) \;\Rightarrow\; k = \frac{z_1 - z_2}{s_1 - s_2} \bmod n
$$

and then the private key follows from either signature:

$$
d = \frac{s_1 k - z_1}{r} \bmod n
$$

`ecc-toy.js` does exactly this on the toy curve:

```
Nonce reuse: two signatures share r = 10 (that's how it's spotted)
  recovered k = 3, recovered private key d = 13 (the real d is 13)
```

This isn't theoretical:

- In 2010, Sony's PlayStation 3 signed its firmware with a **constant** $k$, and the master signing key was computed and published.
- In 2013, a flawed random number generator in Android's Java libraries repeated nonces in Bitcoin wallets, and funds were stolen.

Even a few **biased** bits of $k$ across many signatures can leak the key, through lattice attacks (for example, the Minerva and TPM-Fail timing leaks in 2019).

## The fix: deterministic nonces

- **RFC 6979** derives $k$ for ECDSA deterministically from the private key and the message hash, using HMAC. There's no random number generator to fail.
- **EdDSA** (Ed25519) builds this in: the nonce is $r = H(\text{prefix} \,\|\, m)$, where the prefix is secret key material. The same message always gives the same signature, and different messages get unrelated nonces. Ed25519 also has fast, complete formulas, and fewer implementation pitfalls. It's the default choice for new designs.

## Choosing a signature scheme

| Scheme | Public key | Signature | Notes |
|---|---|---|---|
| **Ed25519** | 32 B | 64 B | deterministic; fast; SSH, Signal, Git, many APIs |
| ECDSA P-256 | 64 B | 64 B | the TLS and WebAuthn workhorse |
| RSA-PSS 3072 | 384 B | 384 B | large, but verification is very fast |
| **ML-DSA-65** (post-quantum) | 1,952 B | 3,309 B | FIPS 204; chapter 6 |

## Sign the right thing

- Sign a **hash of the full message**, plus the context: purpose, protocol version, recipient. Otherwise a signature made for one purpose may be replayed for another.
- Make the signed data **unambiguous**: concatenating fields without lengths lets `("ab", "c")` and `("a", "bc")` sign identically. Use length prefixes or a canonical encoding.
- A signature proves *who signed* the bytes, not *that they're true*. And keys can be stolen, so plan for revocation and rotation.
