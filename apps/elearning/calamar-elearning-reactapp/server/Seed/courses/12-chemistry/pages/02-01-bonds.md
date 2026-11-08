# Ionic, covalent and metallic bonds

Atoms bond because the bonded arrangement has lower energy than the separate atoms. What kind of bond forms depends on how strongly each atom holds its electrons: on their **electronegativities**.

## From covalent to ionic

```bash
node chem.js bond C H
node chem.js bond H O
node chem.js bond Na Cl
```

```
C (2.55) - H (2.20): difference 0.35 -> non-polar covalent, about 3 % ionic character
H (2.20) - O (3.44): difference 1.24 -> polar covalent, about 32 % ionic character
Na (0.93) - Cl (3.16): difference 2.23 -> ionic, about 71 % ionic character
```

The difference in electronegativity, $\Delta\chi$, places a bond on a continuous scale. Common rules of thumb:

| $\Delta\chi$ | Bond | Electrons |
|---|---|---|
| below about 0.4 | non-polar covalent | shared equally |
| about 0.4 to 1.8 | polar covalent | shared unequally |
| above about 1.8 | ionic | transferred |

Pauling estimated the fraction of ionic character as:

$$
\text{ionic character} \approx 1 - e^{-(\Delta\chi)^2/4}
$$

The boundaries are conventions: bonding is a continuum, and no bond is 100 % ionic.

## Ionic bonds

Sodium gives an electron to chlorine, and the ions $\text{Na}^+$ and $\text{Cl}^-$ attract each other. Ionic compounds don't form separate molecules: each ion is surrounded by ions of the opposite charge in a **crystal lattice**. In salt, each $\text{Na}^+$ has six $\text{Cl}^-$ neighbors and vice versa. So:

- ionic compounds have **high melting points** (NaCl melts at 801 °C): melting means breaking many strong attractions;
- they are **brittle**: shifting a layer brings like charges face to face, and the crystal splits;
- they **conduct electricity when molten or dissolved**, when the ions can move, but not as solids.

The formula of an ionic compound balances the charges: $\text{Mg}^{2+}$ and $\text{Cl}^-$ give $\text{MgCl}_2$; $\text{Al}^{3+}$ and $\text{O}^{2-}$ give $\text{Al}_2\text{O}_3$.

The strength of the attraction follows **Coulomb's law**: the force between charges $q_1$ and $q_2$ at distance $r$ is proportional to $q_1 q_2 / r^2$. Doubly charged, small ions attract much more strongly: magnesium oxide ($\text{Mg}^{2+}\text{O}^{2-}$) melts at about 2,850 °C.

## Covalent bonds

Between non-metals, neither atom can take the electrons, so they **share** a pair. In a **Lewis structure**, each line is a shared pair:

```
H-H         O=O         N≡N         H-O-H
single      double      triple      water: two single bonds,
bond        bond        bond        and two lone pairs on O
```

Count the electrons around each atom: in water, oxygen has two bonding pairs plus two **lone pairs**, eight in all, an octet; each hydrogen has two, like helium.

More shared pairs make shorter, stronger bonds:

| Bond | Length (pm) | Energy (kJ/mol) |
|---|---|---|
| C–C | 154 | 348 |
| C=C | 134 | 614 |
| C≡C | 120 | 839 |
| N≡N | 110 | 945 |

The triple bond of $\text{N}_2$ is one of the strongest bonds known, which is why the nitrogen of the air is so unreactive, and why fixing it (the Haber-Bosch process) takes so much energy.

In a **polar** bond, the more electronegative atom gets a partial negative charge ($\delta-$), the other a partial positive ($\delta+$). In water, $\text{O}^{\delta-}$ and $\text{H}^{\delta+}$: the origin of nearly all of water's special properties.

## Metallic bonds

In a metal, the atoms give up their valence electrons to a shared "sea" of electrons that move freely through a lattice of cations. This explains the properties of metals:

- they **conduct** electricity and heat: the electrons move freely;
- they are **malleable and ductile**: layers of atoms can slide without breaking the bonding, because the electron sea moves with them;
- they are **shiny**: the free electrons absorb and re-emit light of all visible wavelengths.

## Check yourself

1. Classify the bonds in $\text{KF}$, $\text{CO}_2$, $\text{Cl}_2$ and $\text{NH}_3$. Check with `node chem.js bond`.
2. Write the formula of the ionic compound of calcium and nitrogen ($\text{N}^{3-}$).
3. Draw the Lewis structure of $\text{CO}_2$. How many lone pairs does each oxygen have?
