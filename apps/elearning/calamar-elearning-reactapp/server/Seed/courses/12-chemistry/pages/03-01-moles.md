# The mole

## A chemist's dozen

Atoms are far too small to count, so chemists count them in batches. One **mole** (mol) is exactly $6.02214076 \times 10^{23}$ particles, the **Avogadro constant** $N_A$. The number was chosen so that:

> one mole of a substance has a mass in grams equal to its mass in atomic mass units.

A carbon-12 atom has a mass of 12 u, so a mole of carbon-12 has a mass of 12 g. A water molecule has about 18 u, so a mole of water, about $6 \times 10^{23}$ molecules, is 18 g: a tablespoon. (Since 2019, the mole is defined by fixing $N_A$ exactly; the 12 g relation is now very nearly, not exactly, true.)

## Molar mass

The **molar mass** $M$ of a compound, in g/mol, is the sum of the atomic weights of its atoms:

$$
M(\text{H}_2\text{O}) = 2 \times 1.008 + 15.999 = 18.015\ \text{g/mol}
$$

```bash
node chem.js mass H2O "Ca(OH)2" CuSO4.5H2O C6H12O6 NaCl
```

```
H2O            18.015 g/mol
Ca(OH)2        74.092 g/mol
CuSO4.5H2O     249.677 g/mol
C6H12O6        180.156 g/mol
NaCl           58.440 g/mol
```

Parentheses multiply what they contain: $\text{Ca(OH)}_2$ has one Ca, two O and two H. The dot in $\text{CuSO}_4 \cdot 5\text{H}_2\text{O}$ means a **hydrate**: blue copper sulfate crystals hold five water molecules per formula unit (write it with a `.` for the script).

## Converting between grams, moles and particles

The three key relations:

$$
n = \frac{m}{M}, \qquad N = n\, N_A
$$

where $n$ is the amount in moles, $m$ the mass in grams and $N$ the number of particles.

```bash
node chem.js moles NaCl 5.85
node chem.js grams CO2 0.25
```

```
5.85 g of NaCl / 58.440 g/mol = 0.1001 mol = 6.028e+22 formula units
0.25 mol of CO2 x 44.009 g/mol = 11.00 g
```

A teaspoon of salt (about 6 g) is a tenth of a mole: 60 billion trillion sodium ions, and as many chloride ions.

## Percent composition

What fraction of glucose's mass is carbon?

```bash
node chem.js comp C6H12O6
```

```
C6H12O6: 180.156 g/mol
  C     6 x   12.011 =    72.066 g    40.00 %
  H    12 x    1.008 =    12.096 g     6.71 %
  O     6 x   15.999 =    95.994 g    53.28 %
```

## Empirical formulas

Run the calculation backwards. An analysis lab burns an unknown compound and finds 40.0 % carbon, 6.7 % hydrogen and 53.3 % oxygen by mass. Take 100 g: divide each mass by the atomic weight to get moles, then divide by the smallest:

```bash
node chem.js empirical C:40.0 H:6.7 O:53.3
```

```
element  g per 100 g   mol      ratio
  C          40.0    3.330     1.00
  H           6.7    6.647     2.00
  O          53.3    3.331     1.00
empirical formula: CH2O
```

The **empirical formula** gives the simplest ratio of atoms: $\text{CH}_2\text{O}$. The **molecular formula** is a whole-number multiple of it, which a molar mass measurement decides: $\text{CH}_2\text{O}$ itself is formaldehyde (30 g/mol), $\text{C}_2\text{H}_4\text{O}_2$ is acetic acid (60 g/mol), and $\text{C}_6\text{H}_{12}\text{O}_6$ is glucose (180 g/mol). All three have the same composition by mass.

When the ratios aren't whole numbers, multiply them: 1 : 1.5 becomes 2 : 3. The script tries multipliers up to 6.

## Check yourself

1. What is the molar mass of aspirin, $\text{C}_9\text{H}_8\text{O}_4$? How many molecules are in a 500 mg tablet?
2. Which contains more atoms: 10 g of aluminium or 10 g of gold?
3. A compound is 85.6 % carbon and 14.4 % hydrogen, with a molar mass of 56 g/mol. Find its empirical and molecular formulas.
