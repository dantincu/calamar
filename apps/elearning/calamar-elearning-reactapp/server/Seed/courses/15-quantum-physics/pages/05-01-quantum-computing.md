# Gates, circuits and algorithms

## The idea

In 1982 Richard Feynman pointed out that simulating quantum systems on classical computers takes exponential effort, and proposed building computers out of quantum systems instead. A quantum computer:

1. starts its qubits in $|00\ldots0\rangle$;
2. applies a sequence of gates, a **quantum circuit**, which builds superpositions and entanglement and steers the amplitudes by interference;
3. measures the qubits, giving a random bit string, ideally one where the right answer is very likely.

Any quantum computation can be built from one-qubit gates plus one two-qubit gate such as CNOT: they form a **universal** set, like NAND for classical logic.

It is a common misconception that a quantum computer "tries all answers in parallel". It does act on all $2^n$ amplitudes at once, but measurement returns only one random result. The art is to make the wrong answers **cancel** and the right ones **reinforce**, which is possible only for problems with special structure.

## Deutsch's algorithm: the first speed-up

A function $f$ takes one bit and returns one bit. It is either **constant** ($f(0) = f(1)$) or **balanced** ($f(0) \ne f(1)$). Classically, you must evaluate it twice to know which. David Deutsch showed in 1985 that a quantum computer needs **one** evaluation.

The function is given as a gate (an **oracle**) that maps $|x\rangle|y\rangle \to |x\rangle|y \oplus f(x)\rangle$. Prepare the second qubit in $|1\rangle$ and put both through Hadamards: the oracle then writes $f$ into the **phase** of the first qubit, $(-1)^{f(x)}$. A final Hadamard interferes the two phases: it gives $|0\rangle$ if they are equal (constant) and $|1\rangle$ if they differ (balanced). The project runs it.

David Deutsch's toy problem was later generalized (Deutsch-Jozsa, Bernstein-Vazirani, Simon) to problems with exponential speed-ups, which led directly to Shor's algorithm.

## Grover's search

Searching an unsorted list of $N$ items for one marked item takes, classically, $N/2$ looks on average. Lov Grover showed in 1996 that a quantum computer needs only about $\frac{\pi}{4}\sqrt N$. Each Grover iteration:

1. the **oracle** flips the sign of the marked item's amplitude;
2. the **diffusion** step reflects every amplitude about the average.

The marked amplitude, below the average after step 1, ends far above it after step 2. Repeating grows it step by step:

```bash
node qubits.js grover 3 5
```

```
Grover search for item 5 (|101>) among 8: optimal number of iterations floor(pi/4 sqrt N) = 2

iteration   probability of the target
    0       0.1250
    1       0.7813
    2       0.9453   <- stop here
    3       0.3301
    4       0.0122

a classical search needs on average about N/2 = 4 looks; Grover needs about sqrt N
```

Two iterations find the item among 8 with 94.5 % probability. Go on too long and the probability falls again: the amplitude rotates past its target, like a pendulum. For a million items, Grover needs about 785 iterations instead of 500,000 looks: a quadratic, not exponential, speed-up.

## Shor's algorithm and cryptography

In 1994, Peter Shor found a quantum algorithm that factors large numbers and computes discrete logarithms in polynomial time, exponentially faster than the best known classical methods. It works by turning factoring into finding the **period** of a function, and finding periods with the **quantum Fourier transform**, another interference trick.

This matters because the security of RSA and of elliptic-curve cryptography, which protect almost all internet traffic, rests on those problems being hard (see the course *Applied Cryptography*). A large enough quantum computer would break them. It doesn't exist yet: estimates in recent research put the requirement at around a million noisy physical qubits, running for days, to factor a 2048-bit RSA key. But data recorded today could be decrypted later, so the world is already switching to **post-quantum cryptography**, standardized by NIST in 2024 (ML-KEM and ML-DSA). Grover's algorithm, by contrast, only halves the effective key length of symmetric ciphers, which is why AES-256 is considered safe.

## Building real quantum computers

Qubits are fragile: any interaction with the environment causes **decoherence**, and every gate has a small error. Today's platforms include superconducting circuits cooled to about 10 millikelvin (Google, IBM), trapped ions held by electric fields (Quantinuum, IonQ), neutral atoms held by laser tweezers, and photons.

The way forward is **quantum error correction**: encoding one reliable "logical" qubit in many physical ones, and continuously detecting and fixing errors without measuring the data itself. It works only if the physical error rates are below a threshold. In recent years, experiments have begun to show logical qubits that get *better* as more physical qubits are added, the key milestone on the road to useful machines.

What quantum computers are expected to be good at: simulating molecules and materials (Feynman's original idea, with applications to chemistry, drugs and batteries), factoring and other algebraic problems, and some optimization and search problems with modest speed-ups. They will not replace ordinary computers for most tasks.

## Check yourself

1. How many Grover iterations are optimal for $N = 64$? Run `node qubits.js grover 6 42` and check the probability at that point.
2. Why doesn't measuring an equal superposition of all $2^n$ inputs give us $f$ of all of them at once?
3. Why does Grover's algorithm make AES-128 weaker but leave AES-256 strong enough?
