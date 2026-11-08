# Atoms and their spectra

## The puzzle of the stable atom

Rutherford's experiment (1911) showed that an atom is a tiny positive nucleus with electrons around it. But classical physics says an orbiting electron is an accelerating charge, which must radiate light, lose energy, and spiral into the nucleus in about $10^{-11}$ seconds. Atoms should not exist.

## Line spectra

A second puzzle: heated or electrically excited gases don't glow with a continuous rainbow, but at a few sharp wavelengths, a **line spectrum**, different for each element. It is so characteristic that helium was discovered in the Sun's spectrum (1868) before it was found on Earth. For hydrogen, Johann Balmer found in 1885 that the visible lines fit a simple formula, later generalized by Johannes Rydberg:

$$
\frac{1}{\lambda} = R\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right), \qquad R \approx 1.097 \times 10^7\ \text{m}^{-1}
$$

with whole numbers $n_2 > n_1$; the visible (Balmer) lines have $n_1 = 2$. Nobody knew why.

## The Bohr model

In 1913, Niels Bohr proposed that:

1. the electron can only occupy certain orbits, with fixed energies, in which it doesn't radiate;
2. it emits or absorbs a photon only when it **jumps** between them, with $hf = E_{\text{upper}} - E_{\text{lower}}$.

Choosing the orbits so that the electron's angular momentum is a whole multiple of $\hbar = h/2\pi$, he derived the energy levels of hydrogen:

$$
E_n = -\frac{13.6\ \text{eV}}{n^2}, \qquad n = 1, 2, 3, \dots
$$

```bash
node quantum.js hydrogen
```

```
level   energy (eV)
n = 1     -13.606
n = 2      -3.401
n = 3      -1.512
n = 4      -0.850
n = 5      -0.544
n = 6      -0.378

Balmer lines (down to n = 2), from 1/lambda = R (1/2² - 1/n²):
  n = 3 -> 2   656.5 nm (in vacuum)   H-alpha (red)
  n = 4 -> 2   486.3 nm (in vacuum)   H-beta (blue-green)
  n = 5 -> 2   434.2 nm (in vacuum)   H-gamma (violet)
  n = 6 -> 2   410.3 nm (in vacuum)   H-delta (violet)
  n = 7 -> 2   397.1 nm (in vacuum)   (near ultraviolet)
series limit: 364.7 nm; ionization energy from n = 1: 13.606 eV
```

The energies are negative because the electron is bound: 13.6 eV is needed to free it from the lowest level, the **ground state**. The jump from $n = 3$ to $n = 2$ releases $3.401 - 1.512 = 1.889$ eV, a photon of $1239.8 / 1.889 = 656$ nm: the red H-alpha line, which colors the glowing gas clouds in astronomical photographs. (Tables usually give 656.3 nm, the wavelength in air.) Bohr's formula reproduced the Rydberg constant from the electron's mass and charge and Planck's constant: a triumph.

Jumps down to $n = 1$ give the ultraviolet **Lyman series**, down to $n = 3$ the infrared **Paschen series**.

## Why the Bohr model is wrong (but useful)

Bohr's model works only for hydrogen and other one-electron ions, and its picture of electrons on circular orbits is wrong: the next pages replace it with wave functions. But two of its ideas survive unchanged:

- atoms have **discrete energy levels**;
- light is emitted or absorbed in **jumps** between them, with $hf = \Delta E$.

That is the principle of spectroscopy, the main way we know what stars, planets and distant galaxies are made of; of neon signs and sodium street lamps; of fluorescent tubes and LEDs; and of lasers, which make many atoms emit identical photons in step.

The **Franck-Hertz experiment** (1914) confirmed discrete levels directly: electrons passing through mercury vapor lost energy only in steps of 4.9 eV, and the vapor glowed with ultraviolet light of exactly $1239.8 / 4.9 \approx 253$ nm.

## Check yourself

1. What wavelength does hydrogen emit in the jump from $n = 2$ to $n = 1$ (Lyman alpha)? In what part of the spectrum is it?
2. Why can hydrogen at room temperature absorb ultraviolet light but not the visible Balmer wavelengths? (Hint: what level are almost all the atoms in?)
3. How much energy is needed to ionize a hydrogen atom that is already in the $n = 3$ level?
