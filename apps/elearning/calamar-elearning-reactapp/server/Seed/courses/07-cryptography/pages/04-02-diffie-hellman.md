# Diffie-Hellman key exchange

In 1976, Whitfield Diffie and Martin Hellman showed how two parties can agree on a secret **over a public channel**, without any prior shared key. It's the foundation of TLS, SSH, Signal and WireGuard.

## The protocol

Public parameters: a large prime $p$, and a generator $g$ of a large subgroup of the integers modulo $p$.

| Alice | Public channel | Bob |
|---|---|---|
| picks a secret $a$ | | picks a secret $b$ |
| $A = g^a \bmod p$ | $A \longrightarrow$ | |
| | $\longleftarrow B$ | $B = g^b \bmod p$ |
| $s = B^a \bmod p$ | | $s = A^b \bmod p$ |

Both get the same value, because

$$
B^a = (g^b)^a = g^{ab} = (g^a)^b = A^b \pmod p
$$

An eavesdropper sees $p$, $g$, $A$ and $B$, and must compute $g^{ab}$: the **computational Diffie-Hellman problem**. The obvious way is to recover $a$ from $A = g^a$, which is the **discrete logarithm problem**.

## By hand

`dh-toy.js` starts with $p = 23$, $g = 5$, $a = 6$, $b = 15$:

$$
A = 5^{6} \bmod 23 = 8, \qquad B = 5^{15} \bmod 23 = 19, \qquad s = 19^{6} \bmod 23 = 8^{15} \bmod 23 = 2
$$

With $p = 23$, Eve simply tries every exponent. At realistic sizes (the script also runs a 2048-bit exchange in the RFC 3526 group), the best discrete-log algorithms are sub-exponential, like factoring. So finite-field DH needs 2048 to 3072-bit primes, the same sizes as RSA.

## Choosing the group

- Use **standardized groups**: RFC 3526 or RFC 7919 for finite fields, or X25519 and P-256 for elliptic curves. Generating your own parameters is a trap.
- A **safe prime** $p = 2q + 1$ ($q$ prime) leaves only tiny subgroups of order 1 and 2. Otherwise, check that received public values lie in the right subgroup: **small-subgroup attacks** leak bits of the private key.
- The 2015 **Logjam** attack precomputed discrete logs for a handful of widely shared 512-bit groups, which "export-grade" TLS still accepted, and estimated that a nation-state could do the same for the most common 1024-bit groups.

## Forward secrecy

If $a$ and $b$ are **ephemeral** (fresh for each session, then erased), recording the traffic and later stealing a server's long-term key reveals nothing. The session key was never derived from the long-term key. That's **forward secrecy**, which TLS 1.3 requires. `secure-channel.js` deletes its ephemeral private key right after the handshake.

## The man in the middle

Plain Diffie-Hellman **authenticates nobody**. Mallory, sitting in the middle, runs one exchange with Alice and another with Bob, and relays (and reads) everything:

```
Man in the middle: Mallory shares a key with Alice? true / with Bob? true / Alice and Bob share one? false
```

The fix is to **authenticate the exchange**: the server signs its DH share with the private key of its certificate (TLS), or both parties sign with known identity keys (the project), or a pre-shared secret is mixed in. DH provides secrecy, and signatures provide identity. Secure protocols need both.

## In practice: X25519

Modern protocols run Diffie-Hellman on an elliptic curve (next lesson). **X25519** uses 32-byte keys, takes microseconds, and is designed to be hard to implement wrongly:

```js
const shared = crypto.diffieHellman({ privateKey: alice.privateKey, publicKey: bob.publicKey });
```

Never use the raw shared secret as a key: pass it through HKDF together with the handshake transcript.
