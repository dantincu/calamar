# The uncertainty principle

## Heisenberg's relation

In 1927, Werner Heisenberg showed that position and momentum can't both be sharply defined at once. Their spreads, measured as standard deviations, obey:

$$
\Delta x\, \Delta p \ge \frac{\hbar}{2}
$$

This is not a statement about clumsy instruments. It follows from the wave nature of matter: a wave with a precise wavelength (so a precise momentum, $p = h/\lambda$) must extend over a long distance, and a wave packet confined to a small region must be built from many wavelengths. The same mathematics says that a short musical note can't have a perfectly defined pitch.

## How big is it?

```bash
node quantum.js uncertainty 0.1
```

```
dx = 0.1 nm: dp >= hbar / (2 dx) = 5.273e-25 kg m/s; for an electron, dv >= 579 km/s
kinetic energy of that momentum spread: 0.952 eV
```

An electron confined to 0.1 nm, the size of an atom, has a velocity spread of at least 580 km/s and a kinetic energy of the order of an electronvolt. For a 1 g marble located to within a micrometer, $\Delta v \ge 5 \times 10^{-26}$ m/s: utterly negligible.

## Why atoms don't collapse

The uncertainty principle answers the puzzle of the stable atom. If the electron fell into the nucleus, it would be confined to a tiny region, so its momentum, and kinetic energy, would be huge. Squeezing the electron closer lowers its potential energy but raises its kinetic energy. The balance sets the size of the atom.

A rough estimate: an electron within a distance $r$ of the proton has momentum of order $\hbar/r$, so energy:

$$
E(r) \approx \frac{\hbar^2}{2mr^2} - \frac{ke^2}{r}
$$

Find the minimum (set $dE/dr = 0$): $r = \hbar^2/(mke^2) = 0.053$ nm, the **Bohr radius**, and $E = -13.6$ eV, the true ground-state energy of hydrogen. A one-line argument gives the size and energy of an atom.

The same principle explains the **zero-point energy** of the particle in a box and the harmonic oscillator: a confined particle can't be at rest, because that would make both its position and its momentum certain. It is why helium stays liquid down to absolute zero at normal pressure: its atoms are light and only weakly attracted, and their zero-point motion is too large for them to settle into a solid.

## Energy and time

A similar relation links energy and time:

$$
\Delta E\, \Delta t \gtrsim \frac{\hbar}{2}
$$

Its meaning is subtler (time is not an observable like position), but its consequences are measurable. An excited atom that lives for a time $\tau$ emits light with an energy spread of about $\hbar/\tau$: short-lived states give broad spectral lines. Unstable particles at accelerators that live $10^{-24}$ s show up as broad bumps in the energy spectrum, and their widths measure their lifetimes.

## Complementary properties

Position and momentum are **complementary**: measuring one precisely disturbs the other. The double slit shows the same thing: knowing which slit (a position) destroys the interference (which depends on momentum, through the wavelength). Niels Bohr made complementarity a central idea of the "Copenhagen" view of quantum mechanics. The next chapters meet another pair of complementary quantities: spin along different directions.

## Check yourself

1. A proton is confined to a nucleus about $10^{-14}$ m across. Estimate its minimum momentum spread and kinetic energy in MeV. (This is why nuclear energies are millions of times larger than chemical energies.)
2. Redo the atom estimate for a muon, a particle like the electron but 207 times heavier. How big is "muonic hydrogen"?
3. An excited state lives 10 ns. What is the minimum energy spread of the light it emits, in eV?
