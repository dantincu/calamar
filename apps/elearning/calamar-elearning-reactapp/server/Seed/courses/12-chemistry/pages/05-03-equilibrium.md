# Chemical equilibrium

Many reactions don't go to completion. As products build up, the reverse reaction speeds up, until both directions run at the same rate. The concentrations then stay constant: **dynamic equilibrium**. Molecules still react, but the forward and reverse reactions cancel out.

## The equilibrium constant

For a reaction $a\text{A} + b\text{B} \rightleftharpoons c\text{C} + d\text{D}$, at equilibrium:

$$
K = \frac{[\text{C}]^c [\text{D}]^d}{[\text{A}]^a [\text{B}]^b}
$$

(the **law of mass action**, Guldberg and Waage, 1864). $K$ depends only on temperature. Pure solids and liquids, such as water as a solvent, are left out.

- $K \gg 1$: products dominate; the reaction goes nearly to completion.
- $K \ll 1$: reactants dominate; little product forms.

The same expression with *non-equilibrium* concentrations is the **reaction quotient** $Q$. Compare it with $K$: if $Q < K$, the reaction moves forward; if $Q > K$, backward.

$K$ is linked to the Gibbs energy of the previous pages: $\Delta G^\circ = -RT \ln K$. A negative $\Delta G^\circ$ means $K > 1$.

## Solving for the equilibrium: the ICE table

Hydrogen and iodine form hydrogen iodide, with $K \approx 49$ at about 450 °C. Start with 1 mol/L of each. Write an **ICE** table (Initial, Change, Equilibrium) with an unknown $x$, the extent of reaction:

| | $\text{H}_2$ | $\text{I}_2$ | $2\,\text{HI}$ |
|---|---|---|---|
| Initial | 1 | 1 | 0 |
| Change | $-x$ | $-x$ | $+2x$ |
| Equilibrium | $1 - x$ | $1 - x$ | $2x$ |

$$
K = \frac{(2x)^2}{(1-x)^2} = 49 \quad\Rightarrow\quad \frac{2x}{1-x} = 7 \quad\Rightarrow\quad x = \frac{7}{9} \approx 0.778
$$

The script solves any such table numerically (giving the starting concentrations in the order of the equation, then $K$):

```bash
node physchem.js ice "H2 + I2 -> 2 HI" 1 1 0 49
```

```
K = 49; the reaction advances by x = 0.7778 mol/L

species   start    change            equilibrium
  H2      1.0000   -1x =  -0.7778       0.2222
  I2      1.0000   -1x =  -0.7778       0.2222
  HI      0.0000   +2x =   1.5556        1.556

check: Q = 49.00
```

Most equilibria lead to equations that can't be solved by hand so neatly. Ammonia synthesis, with an illustrative $K = 0.05$:

```bash
node physchem.js ice "N2 + 3 H2 -> 2 NH3" 1 3 0 0.05
```

```
K = 0.05; the reaction advances by x = 0.2916 mol/L

species   start    change            equilibrium
  N2      1.0000   -1x =  -0.2916       0.7084
  H2      3.0000   -3x =  -0.8747        2.125
  NH3     0.0000   +2x =   0.5831       0.5831

check: Q = 0.05000
```

## Le Chatelier's principle

When a system at equilibrium is disturbed, it shifts to partly undo the disturbance (Henry Le Chatelier, 1884):

| Disturbance | Shift |
|---|---|
| add a reactant, or remove a product | forward |
| increase the pressure (gases) | toward fewer gas molecules |
| raise the temperature | in the endothermic direction ($K$ changes) |
| add a catalyst | none: equilibrium is reached faster |

**Ammonia** is the classic case: $\text{N}_2 + 3\,\text{H}_2 \rightleftharpoons 2\,\text{NH}_3$, $\Delta H = -92$ kJ/mol.

- Four gas molecules become two, so **high pressure** favors ammonia. Industrial plants run at 150–250 bar.
- The reaction is exothermic, so **low temperature** favors ammonia, but makes it slow. The compromise is about 400–450 °C with an iron catalyst.
- The ammonia is **removed** by cooling and liquefying it, and the unreacted gases are recycled.

Try it with the script: raise $K$ (a lower temperature) or increase all starting concentrations (a higher pressure), and watch the ammonia at equilibrium.

## Check yourself

1. Write $K$ for $\text{CaCO}_3(s) \rightleftharpoons \text{CaO}(s) + \text{CO}_2(g)$. What does it depend on?
2. Run the hydrogen iodide table with 2 mol/L of $\text{H}_2$ and 1 mol/L of $\text{I}_2$. What fraction of the iodine reacts now? Is that what Le Chatelier predicts?
3. For $\text{N}_2\text{O}_4(g) \rightleftharpoons 2\,\text{NO}_2(g)$, $\Delta H > 0$. Which way does the equilibrium shift if you heat it? If you compress it?
