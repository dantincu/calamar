# The wave function and the Schrödinger equation

## The wave function

In quantum mechanics, everything that can be known about a particle is contained in its **wave function** $\psi(x, t)$ (Greek *psi*), a complex number at each point of space. It is not a physical wave you could see, like a ripple on water. Its meaning was given by Max Born in 1926:

> The probability of finding the particle near position $x$ is proportional to $|\psi(x)|^2$.

$$
P(a \le x \le b) = \int_a^b |\psi(x)|^2\, dx, \qquad \int_{-\infty}^{\infty} |\psi(x)|^2\, dx = 1
$$

This is **Born's rule**. The second equation (**normalization**) says that the particle is certainly somewhere.

Two consequences:

- quantum mechanics predicts **probabilities**, not definite outcomes. Identical electrons, prepared identically, land in different places on the screen. As far as every experiment so far can tell, the randomness is fundamental, not a lack of knowledge.
- waves **add before squaring**. In the double slit, the wave functions from the two slits add: $\psi = \psi_1 + \psi_2$. The probability is $|\psi_1 + \psi_2|^2 = |\psi_1|^2 + |\psi_2|^2 + 2\,\text{Re}(\psi_1^*\psi_2)$. The last term, the **interference term**, can be negative: that is how opening a second slit can make some places *less* likely.

## Superposition

If $\psi_1$ and $\psi_2$ are possible states, so is any combination $a\psi_1 + b\psi_2$ (with $|a|^2 + |b|^2 = 1$ when the two states don't overlap). This **superposition principle** is the source of most quantum phenomena: an electron passing through both slits, a qubit that is both 0 and 1 (chapter 4).

## The Schrödinger equation

How does $\psi$ change in time? Erwin Schrödinger found the equation in 1926. For a particle of mass $m$ moving in one dimension with potential energy $V(x)$:

$$
i\hbar\frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2 \psi}{\partial x^2} + V(x)\,\psi
$$

where $\hbar = h/2\pi = 1.055 \times 10^{-34}$ J·s. Read the right side as "kinetic energy plus potential energy": the second derivative measures how sharply the wave curves, and shorter wavelengths (more curvature) mean more momentum and more kinetic energy, as $p = h/\lambda$ requires.

The equation is **deterministic**: given $\psi$ now, it fixes $\psi$ at all later times. The randomness enters only at measurement, through Born's rule.

## Stationary states

For a particle with a definite energy $E$, the wave function oscillates in time without changing its shape, $\psi(x,t) = \psi(x)\,e^{-iEt/\hbar}$, and $|\psi|^2$ doesn't change at all: a **stationary state**. The shape satisfies the **time-independent Schrödinger equation**:

$$
-\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2} + V(x)\,\psi = E\,\psi
$$

This is the equation physicists and chemists solve most often. For a particle that is confined (bound) by the potential, it has acceptable solutions, ones that stay finite and can be normalized, **only for certain values of $E$**. That is where quantization comes from: not from a rule added by hand, as in Bohr's model, but from the need for a wave to fit its container, as a guitar string can only vibrate at certain notes.

Where $E > V$, the particle is classically allowed, and $\psi$ oscillates, curving toward zero. Where $E < V$, it is classically forbidden: $\psi$ curves away from zero, and for a bound state it must decay exponentially. As the next pages show, it doesn't vanish there: the particle can be found where, classically, it has negative kinetic energy.

## Operators and observables

Each measurable quantity corresponds to an **operator** acting on $\psi$. Momentum is $\hat p = -i\hbar\, d/dx$; energy is the **Hamiltonian** $\hat H = \hat p^2/2m + V$, the right side of the Schrödinger equation. The possible results of a measurement are the operator's **eigenvalues**, and the time-independent equation $\hat H\psi = E\psi$ is an eigenvalue equation. On a computer, $\hat H$ becomes a large matrix, and finding energy levels means finding its eigenvalues: exactly what `schrodinger.js` does on the next page.

## Check yourself

1. A particle's wave function is $\psi(x) = \sqrt 2 \sin(\pi x)$ for $0 \le x \le 1$ and zero elsewhere. Where is the particle most likely to be found? Check that $\psi$ is normalized.
2. Two waves arrive at a point with equal amplitudes. If they are in phase, how does the probability compare with one wave alone? If they are opposite in phase?
3. Why does quantization appear only for *bound* particles, and not for a free electron flying through space?
