# Qubits, superposition and measurement

## The qubit

A **qubit** is any quantum system with two basic states, written $|0\rangle$ and $|1\rangle$ (Dirac's "ket" notation): spin up and down, the horizontal and vertical polarization of a photon, two energy levels of an atom, or the two lowest states of a superconducting circuit. Its general state is a **superposition**:

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle, \qquad |\alpha|^2 + |\beta|^2 = 1
$$

where $\alpha$ and $\beta$ are complex numbers called **amplitudes**. Measuring the qubit (in this basis) gives 0 with probability $|\alpha|^2$ and 1 with probability $|\beta|^2$: Born's rule again. After the measurement, the qubit *is* in the state it was found in; measuring again gives the same answer.

A classical bit is 0 or 1. A qubit, before measurement, is described by two complex numbers: a continuum of possible states. But a measurement gives only one bit of information. The power of quantum computing lies between those two facts.

## Gates

Operations on qubits are **gates**. A one-qubit gate is a 2×2 matrix that acts on the amplitudes, and keeps the total probability equal to 1 (it is **unitary**). The most important:

| Gate | Matrix | Action |
|---|---|---|
| X (NOT) | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ | swaps $\lvert 0\rangle$ and $\lvert 1\rangle$ |
| Z | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ | flips the sign of $\lvert 1\rangle$ (a phase) |
| H (Hadamard) | $\frac{1}{\sqrt 2}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ | makes an equal superposition |

The Hadamard gate is the workhorse:

$$
H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt 2}, \qquad H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt 2}
$$

```bash
node qubits.js run 1 "H 0"
```

```
1 qubit(s), circuit: H 0

basis    amplitude   probability
|0>          0.7071   0.5000
|1>          0.7071   0.5000
```

Measuring this state is a perfect coin toss. Now the essential experiment: apply H **twice**.

```bash
node qubits.js run 1 "H 0; H 0"
```

```
basis    amplitude   probability
|0>          1.0000   1.0000
```

A classical random process applied twice is still random. Here, the second Hadamard brings the qubit back to $|0\rangle$ **with certainty**. Write it out: the two paths to $|1\rangle$ have amplitudes $+\frac12$ and $-\frac12$, and they cancel; the two paths to $|0\rangle$ have $+\frac12$ each, and add. This is **interference**, the same as in the double slit, with amplitudes that can be negative. A sign change between the two Hadamards, the Z gate, flips the result:

```bash
node qubits.js run 1 "H 0; Z 0; H 0"
```

```
basis    amplitude   probability
|1>          1.0000   1.0000
```

The Z gate changes nothing you could measure directly (the probabilities after `H 0; Z 0` are still 50/50), but its **phase** decides the result after interference. Quantum algorithms are built on this: encode information in phases, then interfere.

## Measuring and sampling

The amplitudes can't be observed directly; each run of an experiment gives one random outcome. A rotation by 60° gives probabilities of 3/4 and 1/4:

```bash
node qubits.js run 1 "RY 60 0" --shots 1000
```

```
basis    amplitude   probability
|0>          0.8660   0.7500
|1>          0.5000   0.2500

1000 measurements:
  |0>    764  ###############################
  |1>    236  #########
```

To estimate probabilities, you repeat the experiment many times, and the estimates have statistical errors: with 1,000 shots, about $\sqrt{1000 \times 0.75 \times 0.25} \approx 14$. Real quantum computers report results exactly this way.

## The Bloch sphere

Up to an overall phase, which can't be measured, every qubit state can be written as:

$$
|\psi\rangle = \cos\frac{\theta}{2}|0\rangle + e^{i\varphi}\sin\frac{\theta}{2}|1\rangle
$$

a point on a sphere, the **Bloch sphere**, with $|0\rangle$ at the north pole, $|1\rangle$ at the south pole, and equal superpositions around the equator. One-qubit gates are rotations of the sphere: X is a half-turn around the $x$ axis, Z around the $z$ axis. For a spin, the point on the sphere is literally the direction in which the spin is "up": measuring along that direction gives "up" with certainty. The Stern-Gerlach sequence of the previous chapter is a qubit measured in different bases.

## What a measurement is

Quantum mechanics has two rules for how states change: smoothly and deterministically by the Schrödinger equation (gates), and abruptly and randomly at measurement. Where exactly one ends and the other begins, the **measurement problem**, is still debated. The main views include:

- the **Copenhagen** interpretation: the wave function is a tool for predicting measurement results, and the "collapse" is part of the rules;
- **many worlds** (Hugh Everett, 1957): there is no collapse; every outcome happens, in branches that no longer interfere;
- **pilot-wave** theory (de Broglie, David Bohm): particles have definite positions, guided by the wave function;
- **objective collapse** theories, which modify the Schrödinger equation slightly, and could in principle be tested.

All of them give the same predictions for every experiment done so far. Physicists agree on the **decoherence** mechanism: when a quantum system interacts with its environment, the phases between its components leak away into the environment, and interference becomes impossible to observe. That is why we don't see cats in superposition, and why quantum computers must be so well isolated.

## Check yourself

1. Starting from $|0\rangle$, what state does `X 0; H 0` produce? Predict, then check.
2. Is the state after `H 0` the same as a coin that is "either 0 or 1 with probability ½"? What experiment distinguishes them?
3. Run `node qubits.js run 1 "H 0; T 0; H 0"`. The T gate is a phase of 45°. What are the probabilities, and how do they come from interference?
