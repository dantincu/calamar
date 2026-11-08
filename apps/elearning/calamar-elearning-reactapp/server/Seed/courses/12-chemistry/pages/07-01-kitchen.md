# Vinegar and baking soda, by the numbers

You need all the scripts of the course: `elements.js`, `chem.js`, `balance.js`, `ph.js` and `physchem.js`.

Vinegar is a solution of **acetic acid**, $\text{CH}_3\text{COOH}$, in water. The label says how strong it is: table vinegar is typically 5–6 % and some kinds 9 %. How would a lab check it? And what happens, quantitatively, when you pour it on **baking soda**, sodium bicarbonate ($\text{NaHCO}_3$)?

## Part 1: the titration

A lab technician:

1. pipettes 10.00 mL of vinegar into a 100 mL volumetric flask, and fills it to the mark with water (a tenfold dilution);
2. pipettes 25.00 mL of the diluted vinegar into a flask and adds two drops of phenolphthalein;
3. adds 0.1000 M NaOH from a burette until the solution turns pale pink and stays pink: **20.80 mL**.

The reaction is one to one:

$$
\text{CH}_3\text{COOH} + \text{NaOH} \longrightarrow \text{CH}_3\text{COONa} + \text{H}_2\text{O}
$$

**Your turn.** Before reading on, compute: the moles of NaOH used; the moles of acetic acid in the 25 mL; its concentration in the diluted and in the original vinegar; and the grams of acetic acid per 100 mL.

The solution:

$$
n(\text{NaOH}) = 0.1000 \times 0.02080 = 2.080 \times 10^{-3}\ \text{mol} = n(\text{CH}_3\text{COOH})\ \text{in 25 mL}
$$

$$
c_{\text{diluted}} = \frac{2.080 \times 10^{-3}}{0.02500} = 0.0832\ \text{M}, \qquad c_{\text{vinegar}} = 10 \times 0.0832 = 0.832\ \text{M}
$$

```bash
node chem.js mass CH3COOH
```

```
CH3COOH        60.052 g/mol
```

$$
0.832\ \text{mol/L} \times 60.052\ \text{g/mol} = 50.0\ \text{g/L} = 5.0\ \text{g per 100 mL}
$$

The vinegar is **5 %** acetic acid (by mass per volume), as the label says.

## Part 2: was phenolphthalein the right indicator?

Simulate the titration of the diluted vinegar:

```bash
node ph.js titrate 0.0832 25 0.1 4.76
```

```
25 mL of 0.0832 M weak acid (pKa 4.76) with 0.1 M NaOH: equivalence at 20.80 mL

  NaOH mL    pH
     0.00   2.92
     2.08   3.82
     5.20   4.28
    10.40   4.76   half-way: pH = pKa
    15.60   5.24
    18.72   5.71
    20.59   6.76
    20.80   8.71   equivalence point
    21.01  10.66
    22.88  11.64
    31.20  12.27
    41.60  12.49
```

Phenolphthalein turns pink between about pH 8.2 and 10. The equivalence point is at pH 8.7, and the steep jump around it (from 6.8 to 10.7 in less than half a milliliter) passes right through the indicator's range. Methyl orange, which changes around pH 3.1–4.4, would have changed color far too early, in the buffer region.

What is the pH of the original 5 % vinegar? Run `node ph.js weak-acid 0.832 4.76`, and compare it with the table on the acids page.

## Part 3: vinegar on baking soda

Pour 50 mL of this vinegar onto 5 g of baking soda: it fizzes as carbon dioxide escapes.

```bash
node balance.js "NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2" --have NaHCO3=5 CH3COOH=2.5
```

50 mL of 5.0 g/100 mL vinegar contains 2.5 g of acetic acid:

```
NaHCO3 + CH3COOH -> CH3COONa + H2O + CO2

limiting reagent: CH3COOH, 0.04163 mol of reaction

species       M (g/mol)    mol        grams
  NaHCO3        84.006     0.0416       3.50   used, 1.50 g left over
  CH3COOH       60.052     0.0416       2.50   used, 0.00 g left over
  CH3COONa      82.034     0.0416       3.42   made
  H2O           18.015     0.0416       0.75   made
  CO2           44.009     0.0416       1.83   made
```

The **vinegar is the limiting reagent**: 1.5 g of baking soda stays undissolved at the bottom. What volume of gas is that, at 25 °C and normal pressure?

```bash
node physchem.js gas P=101.325 V=? n=0.04163 T=298.15
```

```
PV = nRT:  P = 101.33 kPa, V = 1.018 L, n = 0.0416 mol, T = 298.15 K (25.00 °C)
```

About **1 liter of CO₂** from a small glass of vinegar: enough to inflate a balloon stretched over the mouth of the bottle, a classic demonstration you can do safely at home. (Some CO₂ stays dissolved, so you will measure a little less.)

## Part 4: the energy

The reaction feels slightly cold: it is endothermic. Dissolving baking soda alone absorbs heat, and the reaction absorbs some more. Why does it happen at all, then? Look at the Gibbs equation, $\Delta G = \Delta H - T\Delta S$: a gas is produced from a solid and a liquid, a large increase in entropy, so $-T\Delta S$ outweighs the small positive $\Delta H$. The reaction is driven by entropy.

## Your turn

**Exercise 1.** How much baking soda would react exactly with the 50 mL of vinegar, with nothing left over? How much CO₂ would 50 mL of 9 % vinegar make with plenty of baking soda?

**Exercise 2.** A second titration gives 20.65 mL, a third 20.85 mL. Compute the mean concentration and the spread. What is the vinegar's strength, with a reasonable uncertainty?

**Exercise 3.** Baking powder contains baking soda plus a dry acid, so it releases CO₂ when it gets wet in a batter. A recipe uses 5 g of baking soda in a dough. Using the ideal gas law, what volume of CO₂ could it release at 180 °C in the oven, if all of it reacted? Why does that make a cake rise?

**Exercise 4.** Descaling: kettle scale is mostly calcium carbonate. Balance `CaCO3 + CH3COOH -> Ca(CH3COO)2 + H2O + CO2`. How many grams of scale can 100 mL of 5 % vinegar dissolve?

## What this shows

Two bottles from a kitchen shelf used every idea in this course: molar masses, a balanced equation, a limiting reagent, the gas law, a weak acid and its titration curve, an indicator chosen with the pH scale, and the entropy that drives an endothermic reaction. Chemistry is a way of counting the world.

Congratulations on finishing the course.
