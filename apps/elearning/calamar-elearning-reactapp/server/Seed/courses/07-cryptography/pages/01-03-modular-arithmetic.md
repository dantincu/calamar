# Modular arithmetic

Public-key cryptography computes in **modular arithmetic**: integers that wrap around at a modulus $n$, like the hours on a clock.

$$
a \equiv b \pmod{n} \iff n \text{ divides } a - b
$$

So $17 \equiv 2 \pmod{5}$, and $-1 \equiv 4 \pmod 5$. Addition, subtraction and multiplication work as usual, reducing at any point: $(a \cdot b) \bmod n = \big((a \bmod n)(b \bmod n)\big) \bmod n$. The attached `modmath.js` implements everything on this page with BigInt.

## Greatest common divisor

Euclid's algorithm uses $\gcd(a, b) = \gcd(b,\ a \bmod b)$ until the remainder is 0:

$$
\gcd(240, 46):\quad 240 = 5 \cdot 46 + 10,\quad 46 = 4 \cdot 10 + 6,\quad 10 = 1 \cdot 6 + 4,\quad 6 = 1 \cdot 4 + 2,\quad 4 = 2 \cdot 2 + 0
$$

so $\gcd(240, 46) = 2$. It takes $O(\log n)$ steps, which is fast even for 4096-bit numbers.

## Modular inverses

Division becomes multiplication by an **inverse**: $a^{-1}$ is the number with $a \cdot a^{-1} \equiv 1 \pmod n$. It exists **if and only if** $\gcd(a, n) = 1$.

The **extended** Euclidean algorithm finds integers $x$ and $y$ with

$$
a x + n y = \gcd(a, n)
$$

When the gcd is 1, reducing modulo $n$ gives $a x \equiv 1$, so $x$ is the inverse. Example: $3^{-1} \bmod 11 = 4$, because $3 \cdot 4 = 12 \equiv 1$.

## Fast exponentiation

Computing $a^e \bmod n$ with $e$ around $2^{2048}$ by repeated multiplication is impossible. **Square-and-multiply** reads the bits of $e$:

$$
a^{13} = a^{1101_2} = a^{8} \cdot a^{4} \cdot a^{1}, \qquad a \to a^2 \to a^4 \to a^8 \text{ by squaring}
$$

That's about $\log_2 e$ squarings, plus at most as many multiplications: about 4,000 operations for a 2048-bit exponent. (Production code uses constant-time variants, because the branch on each bit leaks the exponent through timing.)

## Fermat and Euler

**Fermat's little theorem**: for a prime $p$ and $a$ not divisible by $p$,

$$
a^{p-1} \equiv 1 \pmod p
$$

**Euler's theorem** generalizes it: if $\gcd(a, n) = 1$, then $a^{\varphi(n)} \equiv 1 \pmod n$, where $\varphi(n)$ (Euler's totient) counts the integers from 1 to $n$ that are coprime with $n$. For two distinct primes,

$$
\varphi(pq) = (p-1)(q-1)
$$

which is the heart of RSA. Anyone who can factor $n = pq$ can compute $\varphi(n)$, and nobody else can.

## Finding big primes

Primes are plentiful: by the prime number theorem, a random 1024-bit number is prime with probability about $1/\ln(2^{1024}) \approx 1/710$, or $1/355$ if you only try odd numbers. So generate random candidates, and test them.

Fermat's theorem suggests a test (if $a^{n-1} \not\equiv 1$, then $n$ is composite), but **Carmichael numbers** fool it for every base coprime with them. $561 = 3 \cdot 11 \cdot 17$ is the smallest: `modmath.js` shows $7^{560} \equiv 1 \pmod{561}$. The **Miller-Rabin** test fixes this. Write $n - 1 = 2^s d$ with $d$ odd; for a random base $a$, the sequence $a^d, a^{2d}, \dots, a^{2^{s-1}d} \bmod n$ must start at 1 or reach $n - 1$ if $n$ is prime. A composite passes one round with probability at most $\tfrac{1}{4}$, so 40 rounds leave an error probability of at most $4^{-40} = 2^{-80}$.

## The Chinese remainder theorem

If $m_1$ and $m_2$ are coprime, the system $x \equiv a_1 \pmod{m_1}$, $x \equiv a_2 \pmod{m_2}$ has exactly one solution modulo $m_1 m_2$:

$$
x = a_1 \, m_2 \,(m_2^{-1} \bmod m_1) + a_2 \, m_1 \,(m_1^{-1} \bmod m_2) \pmod{m_1 m_2}
$$

Example: $x \equiv 2 \pmod 3$ and $x \equiv 3 \pmod 5$ give $x = 8$. RSA implementations use CRT to compute modulo $p$ and $q$ separately, which is about 4 times faster than working modulo $n$.

## Run it

```bash
$ node modmath.js
gcd(240, 46) = 2n
egcd: 240*(-9) + 46*(47) = 2 = gcd 2
inverse of 3 mod 11 = 4n
7^560 mod 561 = 1n  (561 = 3*11*17 is a Carmichael number: it fools Fermat's test)
Miller-Rabin says 561 is prime? false
a random 512-bit prime (23 ms): …
```

(The `n` suffix is how Node prints BigInt values.)
