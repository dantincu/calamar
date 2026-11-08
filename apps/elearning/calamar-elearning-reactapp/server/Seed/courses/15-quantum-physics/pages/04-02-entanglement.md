# Entanglement and Bell's inequality

## Two qubits

Two qubits have four basis states, $|00\rangle, |01\rangle, |10\rangle, |11\rangle$, and their general state is a superposition of all four, with four amplitudes. $n$ qubits need $2^n$ amplitudes: 300 qubits need more numbers than there are atoms in the observable universe. This exponential growth is why quantum systems are so hard to simulate classically, and why quantum computers might be powerful.

(The simulator writes basis states with qubit 0 on the right: $|10\rangle$ means qubit 1 is 1 and qubit 0 is 0.)

## Making an entangled pair

The **CNOT** (controlled-NOT) gate flips the second qubit (the target) when the first (the control) is 1. Applied after a Hadamard:

```bash
node qubits.js run 2 "H 0; CNOT 0 1" --shots 1000
```

```
2 qubit(s), circuit: H 0; CNOT 0 1

basis    amplitude   probability
|00>         0.7071   0.5000
|11>         0.7071   0.5000

1000 measurements:
  |00>    489  ####################
  |11>    511  ####################
```

This is a **Bell state**:

$$
|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt 2}
$$

Each qubit, on its own, is perfectly random: 50/50. But the two always agree. And the state can't be written as "a state of qubit 0" times "a state of qubit 1": the pair has a definite joint state, while neither qubit has a state of its own. That is **entanglement**.

## Spooky action at a distance?

Separate the two qubits, by a meter or by a thousand kilometers, and measure them. They still agree. Einstein, Podolsky and Rosen argued in 1935 (the **EPR paper**) that this shows quantum mechanics is incomplete: if measuring one instantly tells you the other, then the other must have had its value all along, a "hidden variable" that the theory leaves out. Like a pair of gloves: open one box, find a left glove, and you know the other box holds the right one. No spooky influence needed.

Could that be all there is? For 30 years it seemed a matter of taste. Then, in 1964, John Bell showed that it can be tested.

## Bell's inequality (the CHSH form)

Alice and Bob each receive one qubit of many entangled pairs. Each chooses at random between two measurement directions (Alice: $a$ or $a'$; Bob: $b$ or $b'$) and records $+1$ or $-1$. From many runs, they compute the **correlation** $E(a, b)$, the average of the product of their results. Then the combination (Clauser, Horne, Shimony and Holt, 1969):

$$
S = E(a, b) + E(a, b') + E(a', b) - E(a', b')
$$

**Any local hidden-variable theory gives $|S| \le 2$.** The argument is short: if each qubit carries predetermined answers $A, A', B, B' = \pm 1$ for each direction, then

$$
AB + AB' + A'B - A'B' = A(B + B') + A'(B - B')
$$

and one of $B + B'$, $B - B'$ is 0 while the other is $\pm 2$, so the value is always $\pm 2$, and its average can't exceed 2. Quantum mechanics predicts $E(a, b) = \cos(a - b)$ for this Bell state, measured in the plane of the Bloch sphere, and with the right angles:

```bash
node qubits.js chsh
```

```
Alice measures at 0° or 90°, Bob at 45° or -45°, on the Bell state (|00> + |11>)/sqrt 2

E(a, b)   = 0.7071
E(a, b')  = 0.7071
E(a', b)  = 0.7071
E(a', b') = -0.7071

S = E(a,b) + E(a,b') + E(a',b) - E(a',b') = 2.8284   (2 sqrt 2 = 2.8284)
best local hidden-variable value, over all 16 deterministic strategies: 2
quantum mechanics violates the classical bound: no local hidden-variable theory can explain it
```

The script checks the classical bound by brute force (every assignment of predetermined answers gives at most 2), and computes the quantum value from the simulated state: $2\sqrt 2 \approx 2.83$, the largest value quantum mechanics allows (**Tsirelson's bound**).

(The angles are on the Bloch sphere. For photons, whose polarization directions are half these angles, the same experiment uses polarizers at 0°, 45°, 22.5° and −22.5°.)

## The experiments

John Clauser (1972) and Alain Aspect (1982) measured $S$ with entangled photons, and found the quantum value. Aspect switched the measurement directions while the photons were in flight, so that no signal could tell one side what the other was measuring. The remaining "loopholes" were closed together in 2015, in three experiments (Delft, Vienna and NIST in Boulder). The verdict: **nature violates Bell's inequality**. Either the results are not determined in advance, or there are influences faster than light, and most physicists take the first. Aspect, Clauser and Anton Zeilinger shared the 2022 Nobel Prize in Physics.

## What entanglement can't do

The correlations can't be used to send a message. Alice's results, on their own, are always 50/50, whatever Bob does; the correlation only appears when they compare their records, through an ordinary channel. Entanglement is consistent with relativity: no information travels faster than light.

What entanglement *can* do:

- **quantum key distribution**: the correlations of entangled pairs (or a related protocol with single photons, BB84) give two parties a shared secret key, and any eavesdropper disturbs them detectably;
- **teleportation** of a quantum state, using one entangled pair and two classical bits (the project);
- the speed-ups of **quantum computers**, where entanglement between many qubits is unavoidable.

## Check yourself

1. Run `node qubits.js run 2 "X 0; H 0; CNOT 0 1"`. Which Bell state is this? Do the two qubits agree or disagree?
2. In the CHSH argument, check the claim for $B = +1$, $B' = -1$: what is $A(B + B') + A'(B - B')$?
3. Why can't Alice use the Bell state to send Bob a "1" faster than light, by choosing her measurement direction?
