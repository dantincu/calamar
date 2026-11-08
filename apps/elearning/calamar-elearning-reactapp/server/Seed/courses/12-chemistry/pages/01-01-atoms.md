# Inside the atom

## Three particles

An atom has a tiny, dense **nucleus**, made of protons and neutrons, surrounded by **electrons**.

| Particle | Charge | Mass (kg) | Mass (u) |
|---|---|---|---|
| proton | +1 | $1.673 \times 10^{-27}$ | 1.007 |
| neutron | 0 | $1.675 \times 10^{-27}$ | 1.009 |
| electron | −1 | $9.109 \times 10^{-31}$ | 0.000549 |

The **atomic mass unit** (u, or Da) is 1/12 of the mass of a carbon-12 atom. The electron is about 1,836 times lighter than a proton, so almost all of an atom's mass is in its nucleus.

How empty is an atom? A nucleus is about $10^{-15}$ m across, the atom about $10^{-10}$ m: a ratio of $10^5$. If the nucleus were a marble in the center of a football stadium, the electrons would be specks moving around the outer stands, and everything in between would be empty space. Ernest Rutherford discovered this in 1911, by firing alpha particles at a gold foil: most went straight through, and a few bounced back.

## Atomic number and mass number

- The **atomic number** $Z$ is the number of protons. It defines the element: every atom with 6 protons is carbon.
- The **mass number** $A$ is the number of protons plus neutrons.
- A neutral atom has $Z$ electrons. An **ion** has gained electrons (negative, an *anion*) or lost them (positive, a *cation*).

The notation $^{A}_{Z}\text{X}$ shows both: $^{12}_{6}\text{C}$ has 6 protons and 6 neutrons; $^{35}_{17}\text{Cl}^-$ has 17 protons, 18 neutrons and 18 electrons.

## Isotopes

Atoms of the same element with different numbers of neutrons are **isotopes**. They behave almost identically in chemistry (chemistry is about electrons), but have different masses, and some are radioactive.

- Hydrogen: $^1\text{H}$ (no neutron, 99.98 %), deuterium $^2\text{H}$, and radioactive tritium $^3\text{H}$.
- Carbon: $^{12}\text{C}$ (98.9 %), $^{13}\text{C}$ (1.1 %), and radioactive $^{14}\text{C}$, used for radiocarbon dating (see the reaction rates page).

The **atomic weight** in the periodic table is the average over the natural isotopes, weighted by their abundance. Chlorine is 75.76 % $^{35}\text{Cl}$ (34.969 u) and 24.24 % $^{37}\text{Cl}$ (36.966 u):

$$
\bar m = 0.7576 \times 34.969 + 0.2424 \times 36.966 = 26.492 + 8.960 = 35.45\ \text{u}
$$

which is why chlorine's atomic weight isn't a whole number.

```bash
node chem.js element H C O Na Cl Fe
```

```
H   hydrogen    Z=1      1.008 g/mol  EN 2.20               1s1
C   carbon      Z=6     12.011 g/mol  EN 2.55               1s2 2s2 2p2
O   oxygen      Z=8     15.999 g/mol  EN 3.44               1s2 2s2 2p4
Na  sodium      Z=11    22.990 g/mol  EN 0.93               1s2 2s2 2p6 3s1
Cl  chlorine    Z=17    35.450 g/mol  EN 3.16               1s2 2s2 2p6 3s2 3p5
Fe  iron        Z=26    55.845 g/mol  EN 1.83               1s2 2s2 2p6 3s2 3p6 3d6 4s2
```

The atomic weight in u is numerically equal to the **molar mass** in grams per mole, the link between atoms and the lab balance that the mole page explains. The last two columns, electronegativity and electron configuration, are the subjects of the next pages.

## Where elements come from

Hydrogen and helium formed in the first minutes after the Big Bang. Heavier elements, up to iron, are made by nuclear fusion in stars; most of the elements heavier than iron in supernova explosions and in collisions of neutron stars. The carbon in your body, the oxygen you breathe and the iron in your blood were made inside stars that died before the Sun formed.

## Check yourself

1. How many protons, neutrons and electrons are in $^{56}_{26}\text{Fe}^{3+}$?
2. Boron has two isotopes, $^{10}\text{B}$ (10.013 u) and $^{11}\text{B}$ (11.009 u), and an atomic weight of 10.81. What fraction is $^{11}\text{B}$?
3. Why do isotopes of an element have the same chemistry?
