# Spin, the Pauli principle and the periodic table

## The hydrogen atom, properly

Solving the Schrödinger equation in three dimensions for an electron attracted by a proton gives exactly Bohr's energies, $E_n = -13.6\ \text{eV}/n^2$, but a very different picture. There are no orbits: each state is a three-dimensional standing wave, an **orbital**, labeled by three **quantum numbers**:

| Quantum number | Values | Meaning |
|---|---|---|
| principal $n$ | 1, 2, 3, … | energy and size |
| orbital $\ell$ | 0 to $n - 1$ | shape (angular momentum): s, p, d, f for $\ell = 0, 1, 2, 3$ |
| magnetic $m_\ell$ | $-\ell$ to $+\ell$ | orientation |

So level $n$ contains $n^2$ orbitals: one for $n = 1$ (1s), four for $n = 2$ (2s and three 2p), nine for $n = 3$. The s orbitals are spherical; the p orbitals have two lobes along an axis; the d orbitals have four lobes. These shapes decide the angles of chemical bonds, and so the shapes of molecules.

## Spin

In 1922, Otto Stern and Walther Gerlach sent a beam of silver atoms through a magnet whose field was stronger at one pole than the other. A small magnet moving through such a field is pushed up or down depending on its orientation. Classically, atomic magnets pointing in all directions should have smeared the beam into a continuous band. Instead, it split into **exactly two** spots.

The explanation (George Uhlenbeck and Samuel Goudsmit, 1925): the electron has an intrinsic angular momentum, **spin**, and an associated magnetic moment. Measured along any direction, the spin component takes only two values, $+\hbar/2$ or $-\hbar/2$: "spin up" or "spin down". The name suggests a spinning ball, but the electron is, as far as anyone can tell, a point: spin is a purely quantum property, with no classical picture.

Spin adds a fourth quantum number, $m_s = \pm\frac12$. Protons and neutrons have spin ½ as well, and their magnetic moments are what MRI scanners detect: the protons of the water in your body, flipping in a strong magnetic field.

### Sequential measurements

Stern-Gerlach experiments in sequence show the strangeness of quantum measurement:

1. Pass a beam through a vertical magnet (Z) and keep only the "up" beam. Another Z magnet: all of it comes out "up". The measurement is repeatable.
2. Send the "up" beam through a horizontal magnet (X) instead: it splits 50/50 into "left" and "right".
3. Take the "right" beam and measure Z again: it splits 50/50 into up and down, **as if the first measurement had never happened**.

Measuring X erased the Z information. Spin along Z and along X are complementary, like position and momentum. The next chapter describes this precisely: a spin is a **qubit**.

## The Pauli exclusion principle

Wolfgang Pauli stated in 1925:

> No two electrons in an atom can have the same four quantum numbers.

So each orbital holds at most two electrons, one spin up and one spin down. (Deeper, the rule applies to all particles with half-integer spin, the **fermions**: electrons, protons, neutrons. Particles with integer spin, the **bosons**, such as photons, can crowd into the same state, which is what makes lasers possible.)

## Building the periodic table

Fill the orbitals from the lowest energy, two electrons each:

| Shell $n$ | Orbitals | Electrons | Elements that fill it |
|---|---|---|---|
| 1 | 1s | 2 | H, He |
| 2 | 2s, 2p | 2 + 6 = 8 | Li to Ne |
| 3 | 3s, 3p | 2 + 6 = 8 | Na to Ar |
| 4 | 4s, 3d, 4p | 2 + 10 + 6 = 18 | K to Kr |

In atoms with several electrons, the inner electrons screen the nucleus, and s orbitals penetrate closer to it than p or d orbitals, so they have lower energy: that is why 4s fills before 3d. The rows of the periodic table have 2, 8, 8, 18, 18, 32 and 32 elements, exactly as the counts of orbitals predict: $2n^2$ per shell, with the filling order of the subshells.

Elements in the same column have the same arrangement of outer electrons, which is why they have similar chemistry. The noble gases have full shells and hardly react; the alkali metals have one electron outside a full shell, easily lost; the halogens are one short of a full shell, and grab one. (The course *Chemistry Fundamentals* follows this into bonding.)

Without the Pauli principle, all electrons would fall into the 1s orbital, every atom would be chemically alike, and there would be no chemistry. The principle also makes matter take up space: two atoms can't be pushed into each other because their electrons can't share states. It holds up white dwarf stars against gravity, by the same "degeneracy pressure".

## Check yourself

1. How many electrons can the $n = 3$ shell hold in total? List its orbitals.
2. In a Stern-Gerlach sequence Z (keep up) → X (keep right) → Z, what fraction of the atoms entering the first magnet come out "down" at the end?
3. Why do the elements in the first column of the periodic table, from lithium to cesium, all form $+1$ ions?
