# Electrons and configurations

Chemistry is about electrons: how atoms hold them, share them and exchange them. Their arrangement is explained by quantum mechanics (see the course *Quantum Physics* for the physics behind it). Here are the rules that chemists use.

## Shells, subshells and orbitals

Electrons occupy **orbitals**, regions where they are likely to be found. Each orbital holds at most **two electrons**, with opposite spins (the **Pauli exclusion principle**). Orbitals are grouped:

- by **shell**, numbered $n = 1, 2, 3, \dots$: larger $n$ means farther from the nucleus and higher energy;
- within a shell, by **subshell**: s, p, d and f, with 1, 3, 5 and 7 orbitals, so 2, 6, 10 and 14 electrons.

Shell $n$ contains the subshells up to the $n$-th letter (shell 1: 1s; shell 2: 2s, 2p; shell 3: 3s, 3p, 3d), so it holds at most:

$$
2n^2 \text{ electrons:}\quad 2,\ 8,\ 18,\ 32
$$

## The filling order

Electrons fill the lowest-energy orbitals first (the **aufbau** principle, German for "building up"). The order is not simply shell by shell, because a 4s orbital has lower energy than 3d. The **Madelung rule** gives the order: fill by increasing $n + \ell$ (with $\ell = 0, 1, 2, 3$ for s, p, d, f), and for equal $n + \ell$, smaller $n$ first:

```
1s  2s  2p  3s  3p  4s  3d  4p  5s  4d  5p  6s  4f  5d  6p  7s  5f  6d  7p
```

Within a subshell, electrons spread out over the orbitals with parallel spins before pairing up (**Hund's rule**), as passengers take empty bus seats before sitting next to someone.

```bash
node chem.js element Na Cl Fe Cr Cu Br
```

```
Na  sodium      Z=11    22.990 g/mol  EN 0.93               1s2 2s2 2p6 3s1
Cl  chlorine    Z=17    35.450 g/mol  EN 3.16               1s2 2s2 2p6 3s2 3p5
Fe  iron        Z=26    55.845 g/mol  EN 1.83               1s2 2s2 2p6 3s2 3p6 3d6 4s2
Cr  chromium    Z=24    51.996 g/mol  EN 1.66               1s2 2s2 2p6 3s2 3p6 3d5 4s1
Cu  copper      Z=29    63.546 g/mol  EN 1.90               1s2 2s2 2p6 3s2 3p6 3d10 4s1
Br  bromine     Z=35    79.904 g/mol  EN 2.96               1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p5
```

The script writes the subshells in order of shell number, as chemists usually do. Chromium and copper are **exceptions**: by the rule they would be $3d^4 4s^2$ and $3d^9 4s^2$, but a half-full or full d subshell is especially stable, so one 4s electron moves to 3d. The script knows these exceptions for Cr, Cu, Ag and Au; there are a few more among the heavier elements.

## Valence electrons

The electrons in the outermost shell, the **valence electrons**, take part in bonding. Sodium has one ($3s^1$); chlorine has seven ($3s^2 3p^5$). Atoms tend to gain, lose or share electrons to reach the configuration of the nearest **noble gas**, with a full outer s and p subshell: eight electrons, the **octet rule**.

- Sodium loses its one valence electron to become $\text{Na}^+$, with neon's configuration.
- Chlorine gains one to become $\text{Cl}^-$, with argon's configuration.

That is the whole story of table salt, $\text{NaCl}$, in two lines.

## The periodic table is a map of configurations

Dmitri Mendeleev arranged the elements in 1869 by atomic weight and chemical behavior, leaving gaps for elements not yet discovered, and predicted their properties. Gallium (1875) and germanium (1886) matched his predictions closely. We now know why his table works: it is ordered by $Z$, and its **columns (groups)** contain elements with the same valence configuration.

| Block | Groups | Last subshell filled | Examples |
|---|---|---|---|
| s | 1–2 | s | alkali metals (Li, Na, K), alkaline earth metals (Mg, Ca) |
| d | 3–12 | d | transition metals (Fe, Cu, Zn) |
| p | 13–18 | p | C, N, O, halogens (F, Cl), noble gases (Ne, Ar) |
| f | (below) | f | lanthanides and actinides (U) |

The **row (period)** number is the outermost shell. The widths of the blocks, 2, 10 and 6 columns (and 14 for f), are exactly the subshell capacities.

## Check yourself

1. Write the configuration of phosphorus ($Z = 15$) and of the ion $\text{S}^{2-}$. Which noble gas does the ion resemble?
2. How many unpaired electrons does oxygen have, by Hund's rule?
3. Why are lithium, sodium and potassium all soft, reactive metals that form $+1$ ions?
