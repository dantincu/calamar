# Deutsch, teleportation and Grover

You need `qubits.js`. For each circuit: **predict** the result by hand from the gate rules, run it, and explain any surprise. Remember that qubit 0 is the rightmost bit in the printed states, and that `--qubit k` prints the probabilities of qubit $k$ on its own.

## 1. Deutsch's algorithm: interference

There are four functions from one bit to one bit. Each is an oracle on two qubits (qubit 0 is the input $x$, qubit 1 the output $y$):

| $f$ | Type | Oracle gates |
|---|---|---|
| $f(x) = 0$ | constant | (none) |
| $f(x) = 1$ | constant | `X 1` |
| $f(x) = x$ | balanced | `CNOT 0 1` |
| $f(x) = \text{NOT } x$ | balanced | `CNOT 0 1; X 1` |

The algorithm: `X 1; H 0; H 1`, then the oracle, then `H 0`, and measure qubit 0.

```bash
node qubits.js run 2 "X 1; H 0; H 1; H 0" --qubit 0
node qubits.js run 2 "X 1; H 0; H 1; X 1; H 0" --qubit 0
node qubits.js run 2 "X 1; H 0; H 1; CNOT 0 1; H 0" --qubit 0
node qubits.js run 2 "X 1; H 0; H 1; CNOT 0 1; X 1; H 0" --qubit 0
```

The last line of each:

```
qubit 0 alone: P(0) = 1.0000, P(1) = 0.0000
qubit 0 alone: P(0) = 1.0000, P(1) = 0.0000
qubit 0 alone: P(0) = 0.0000, P(1) = 1.0000
qubit 0 alone: P(0) = 0.0000, P(1) = 1.0000
```

Constant functions give 0, balanced give 1, **with certainty**, after a single use of the oracle. A classical computer must call $f$ twice. The output qubit (qubit 1) never changes in a way that matters: the answer is in the phase that the oracle "kicks back" onto qubit 0.

**Exercise 1.** Work through the circuit for $f(x) = x$ by hand, keeping track of the four amplitudes after each gate. Where does the minus sign appear?

## 2. Teleportation: entanglement

Alice has a qubit in an unknown state $|\psi\rangle$, and wants Bob to have it. She can't measure it (that would destroy it) or copy it (the **no-cloning theorem** forbids copying an unknown quantum state). But if they share an entangled pair, she can **teleport** it (Bennett and colleagues, 1993; first demonstrated with photons in 1997).

- Qubit 0: Alice's state. We prepare a test state with `RY 60 0`, which has $P(1) = 0.25$.
- Qubits 1 and 2: the entangled pair (`H 1; CNOT 1 2`); qubit 1 stays with Alice, qubit 2 goes to Bob.
- Alice performs a **Bell measurement** on qubits 0 and 1 (`CNOT 0 1; H 0`, then measure both) and sends Bob the two classical bits.
- Bob fixes his qubit depending on the bits: X if qubit 1 was 1, Z if qubit 0 was 1. In the circuit, these classically controlled gates are written as `CNOT 1 2` and `CZ 0 2` (by the **deferred measurement principle**, controlling on a qubit and then measuring it gives the same statistics as measuring first and controlling on the result).

```bash
node qubits.js run 3 "RY 60 0; H 1; CNOT 1 2; CNOT 0 1; H 0; CNOT 1 2; CZ 0 2" --qubit 2
```

```
3 qubit(s), circuit: RY 60 0; H 1; CNOT 1 2; CNOT 0 1; H 0; CNOT 1 2; CZ 0 2

basis    amplitude   probability
|000>        0.4330   0.1875
|001>        0.4330   0.1875
|010>        0.4330   0.1875
|011>        0.4330   0.1875
|100>        0.2500   0.0625
|101>        0.2500   0.0625
|110>        0.2500   0.0625
|111>        0.2500   0.0625

qubit 2 alone: P(0) = 0.7500, P(1) = 0.2500
```

Alice's two bits (qubits 0 and 1) are completely random, each combination with probability 1/4: they carry no information about $|\psi\rangle$. Yet Bob's qubit now has $P(1) = 0.25$, like the original. Matching probabilities aren't proof of the same *state*, so undo the preparation on Bob's qubit with the inverse rotation:

```bash
node qubits.js run 3 "RY 60 0; H 1; CNOT 1 2; CNOT 0 1; H 0; CNOT 1 2; CZ 0 2; RY -60 2" --qubit 2
```

```
qubit 2 alone: P(0) = 1.0000, P(1) = 0.0000
```

Bob's qubit returns exactly to $|0\rangle$: it was exactly $|\psi\rangle$. Without Bob's corrections (delete `CNOT 1 2; CZ 0 2`), the same test gives 50/50: the classical bits are essential, which is why teleportation can't send anything faster than light. And Alice's original was destroyed by her measurement: the state moved, it wasn't copied.

**Exercise 2.** Try other test states (`RY 120 0`, or `H 0; T 0`) and check, with the matching inverse, that teleportation works for each. (The inverse of `H 0; T 0` on qubit 2 is the T gate's inverse followed by H; use `Z 2; S 2; T 2` for the inverse of T, since $T^{-1} = T^7 = Z\,S\,T$.)

## 3. Grover's search: amplitude amplification

Find item 42 among $2^6 = 64$:

```bash
node qubits.js grover 6 42
```

**Exercise 3.** Run it. How many iterations does the script choose, and what is the success probability there? Plot (or list) the probability against the iteration number. What shape is it, and why? (Hint: each iteration rotates the state by a fixed angle $2\theta$, with $\sin\theta = 1/\sqrt N$.)

**Exercise 4.** Using the hint, show that the optimal number of iterations is close to $\frac{\pi}{4}\sqrt N$. For $N = 2^{20}$ (about a million), how many iterations is that, and how does it compare with a classical search?

## What this shows

Three circuits, three quantum resources. Deutsch's algorithm uses **interference** to compute a global property of a function with one query. Teleportation uses **entanglement**, together with classical communication, to move a quantum state that can be neither measured nor copied. Grover's search **amplifies** a small amplitude step by step until it dominates. Every quantum algorithm combines these ideas, and every one of them, on a real machine, must fight decoherence.

Congratulations on finishing the course.
