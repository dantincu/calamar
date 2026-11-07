# Elliptic curves

Elliptic-curve cryptography (ECC) runs Diffie-Hellman and signatures in a different group, the points of an elliptic curve over a finite field, where discrete logarithms are much harder. That's why 256-bit curves match 3072-bit RSA.

## The curve

Over a prime field $\mathbb{F}_p$, a curve in short Weierstrass form is the set of points $(x, y)$ satisfying

$$
y^2 \equiv x^3 + a x + b \pmod p, \qquad 4a^3 + 27b^2 \not\equiv 0
$$

plus a **point at infinity** $\mathcal{O}$, which serves as the identity element. (The condition excludes singular curves.)

## Adding points

Geometrically, the line through $P$ and $Q$ meets the curve at a third point, and $P + Q$ is that point's mirror image. Algebraically, for $P = (x_1, y_1)$ and $Q = (x_2, y_2)$:

$$
\lambda = \begin{cases}
\dfrac{y_2 - y_1}{x_2 - x_1} & P \ne Q \quad \text{(chord)} \\[2ex]
\dfrac{3x_1^2 + a}{2y_1} & P = Q \quad \text{(tangent)}
\end{cases}
$$

$$
x_3 = \lambda^2 - x_1 - x_2, \qquad y_3 = \lambda(x_1 - x_3) - y_1
$$

All the divisions are multiplications by modular inverses. Also, $P + (-P) = \mathcal{O}$, where $-P = (x, -y)$. With this addition, the points form an **abelian group**.

## A curve you can check by hand

`ecc-toy.js` uses $y^2 = x^3 + 2x + 2$ over $\mathbb{F}_{17}$, with generator $G = (5, 1)$. Let's double $G$:

$$
\lambda = \frac{3 \cdot 5^2 + 2}{2 \cdot 1} = \frac{77}{2} \equiv 9 \cdot 2^{-1} \equiv 9 \cdot 9 = 81 \equiv 13 \pmod{17}
$$

$$
x_3 = 13^2 - 5 - 5 = 159 \equiv 6, \qquad y_3 = 13\,(5 - 6) - 1 = -14 \equiv 3 \pmod{17}
$$

So $2G = (6, 3)$, as the script prints. Repeated addition visits 18 points, and then $19G = \mathcal{O}$: $G$ has **order** $n = 19$, a prime.

**Hasse's theorem** bounds the number of points: $|\#E - (p + 1)| \le 2\sqrt{p}$. Here $\#E = 19$ and $p + 1 = 18$, well within $2\sqrt{17} \approx 8.2$.

## Scalar multiplication and the ECDLP

The core operation is $kP = P + P + \cdots + P$ ($k$ times), computed with **double-and-add** in about $\log_2 k$ steps, just like square-and-multiply.

The **elliptic-curve discrete logarithm problem** (ECDLP): given $P$ and $Q = kP$, find $k$. For well-chosen curves, the best known attack is Pollard's rho, at about $\sqrt{n}$ steps. A 256-bit group order gives $2^{128}$ work, which is why a 256-bit curve gives 128-bit security.

**ECDH** is Diffie-Hellman in this group: Alice sends $A = aG$, Bob sends $B = bG$, and both compute $abG$. On the toy curve, $a = 7$ and $b = 11$ both yield the point $(5, 1)$.

## Real curves

| Curve | Used for | Notes |
|---|---|---|
| **Curve25519** (X25519) | key exchange | Bernstein, 2006: a Montgomery curve over $p = 2^{255} - 19$; fast, constant-time Montgomery ladder, no invalid-point pitfalls; TLS, SSH, Signal, WireGuard |
| **Ed25519** | signatures | the twisted Edwards form of the same curve; deterministic EdDSA (next lesson) |
| **P-256** (secp256r1) | key exchange, signatures | NIST; ubiquitous in TLS certificates, WebAuthn, smart cards |
| **secp256k1** | signatures | Bitcoin, Ethereum |

## Implementation hazards

- **Invalid-curve attacks**: if an implementation doesn't check that a received point lies on the curve, an attacker can send points on a weaker curve and extract the private key bit by bit. X25519's design makes this check unnecessary.
- **Side channels**: double-and-add branches on the bits of the secret scalar, as in the toy code. Real implementations use constant-time ladders.
- **Don't design curves**: use the standard ones through vetted libraries.
