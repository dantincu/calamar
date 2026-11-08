# Equations, stoichiometry and yield

## Balancing equations

Atoms are neither created nor destroyed in a chemical reaction (Lavoisier's **conservation of mass**), so a chemical equation must have the same number of each atom on both sides. Propane burning in oxygen:

$$
\text{C}_3\text{H}_8 + \text{O}_2 \longrightarrow \text{CO}_2 + \text{H}_2\text{O} \qquad \text{(unbalanced)}
$$

By hand: balance carbon (3 $\text{CO}_2$), then hydrogen (4 $\text{H}_2\text{O}$), then count the oxygen atoms on the right, $3 \times 2 + 4 = 10$, so 5 $\text{O}_2$:

$$
\text{C}_3\text{H}_8 + 5\,\text{O}_2 \longrightarrow 3\,\text{CO}_2 + 4\,\text{H}_2\text{O}
$$

You may change the **coefficients** in front of formulas, never the subscripts inside them: $\text{H}_2\text{O}_2$ is a different substance from $\text{H}_2\text{O}$.

### Balancing as linear algebra

Give each coefficient an unknown, $a\,\text{C}_3\text{H}_8 + b\,\text{O}_2 \to c\,\text{CO}_2 + d\,\text{H}_2\text{O}$, and write one equation per element:

$$
\text{C: } 3a = c, \qquad \text{H: } 8a = 2d, \qquad \text{O: } 2b = 2c + d
$$

Three equations, four unknowns: the solution is fixed up to a common factor. Choose $a = 1$: $c = 3$, $d = 4$, $b = 5$. The script does exactly this, with exact fractions, for any equation:

```bash
node balance.js "C3H8 + O2 -> CO2 + H2O"
node balance.js "KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2"
node balance.js "Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O"
```

```
C3H8 + 5 O2 -> 3 CO2 + 4 H2O
2 KMnO4 + 16 HCl -> 2 KCl + 2 MnCl2 + 8 H2O + 5 Cl2
3 Ca(OH)2 + 2 H3PO4 -> Ca3(PO4)2 + 6 H2O
```

The second would take a while by hand. If the equations have more than one independent solution, the "equation" is really two reactions mixed together, and the script says so.

## Stoichiometry

The coefficients give the ratios in **moles**, not grams. To go from grams of one substance to grams of another: grams → moles (divide by $M$), moles → moles (the coefficient ratio), moles → grams (multiply by $M$).

**Example.** A blast furnace reduces iron ore with carbon monoxide. How much iron does 1 kg of $\text{Fe}_2\text{O}_3$ give, and how much CO2 does it release?

```bash
node balance.js "Fe2O3 + CO -> Fe + CO2" --have Fe2O3=1000
```

```
Fe2O3 + 3 CO -> 2 Fe + 3 CO2

from 1000 g of Fe2O3, 6.262 mol of reaction

species       M (g/mol)    mol        grams
  Fe2O3        159.687     6.2623    1000.00   used, 0.00 g left over
  CO            28.010    18.7868     526.22   needed
  Fe            55.845    12.5245     699.43   made
  CO2           44.009    18.7868     826.79   made
```

About 700 g of iron, and 827 g of $\text{CO}_2$: one reason steelmaking accounts for a large share of the world's industrial CO₂ emissions. Note that mass is conserved: $1000 + 526 = 699 + 827$.

**Another example.** A liter of petrol weighs about 700 g. Modeled as octane:

```bash
node balance.js "C8H18 + O2 -> CO2 + H2O" --have C8H18=700
```

```
2 C8H18 + 25 O2 -> 16 CO2 + 18 H2O
  ...
  CO2           44.009    49.0230    2157.46   made
```

Burning 0.7 kg of fuel makes 2.2 kg of $\text{CO}_2$: the extra mass is oxygen taken from the air.

## The limiting reagent

When reactants aren't in the exact ratio of the equation, one runs out first: the **limiting reagent**. It decides how much product forms. For each reactant, divide its moles by its coefficient; the smallest result limits.

```bash
node balance.js "N2 + H2 -> NH3" --have N2=28 H2=10 --actual NH3=20
```

```
N2 + 3 H2 -> 2 NH3

limiting reagent: N2, 0.9995 mol of reaction

species       M (g/mol)    mol        grams
  N2            28.014     0.9995      28.00   used, 0.00 g left over
  H2             2.016     2.9985       6.04   used, 3.96 g left over
  NH3           17.031     1.9990      34.04   made

percent yield of NH3: 20 / 34.04 g = 58.7 %
```

Ten grams of hydrogen look like less than 28 g of nitrogen, but they are almost 5 moles, more than the 3 moles that 1 mole of nitrogen needs. Nitrogen limits.

## Yield

The **theoretical yield** is what the equation predicts from the limiting reagent. In practice you get less, because of incomplete reactions, side reactions and losses during purification:

$$
\text{percent yield} = \frac{\text{actual yield}}{\text{theoretical yield}} \times 100\,\%
$$

In multi-step syntheses, yields multiply: five steps at 80 % each give $0.8^5 \approx 33\,\%$ overall. That is why chemists work so hard on every step.

## Check yourself

1. Balance $\text{Al} + \text{O}_2 \to \text{Al}_2\text{O}_3$ by hand, then check with the script.
2. How many grams of $\text{O}_2$ are needed to burn 100 g of glucose ($\text{C}_6\text{H}_{12}\text{O}_6$)? How much $\text{CO}_2$ forms?
3. You mix 10 g of $\text{H}_2$ with 64 g of $\text{O}_2$. Which is limiting, and how much water forms?
