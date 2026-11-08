# Thermochemistry

## Enthalpy

Most reactions release or absorb heat. At constant pressure, the heat exchanged is the change in **enthalpy**, $\Delta H$:

- $\Delta H < 0$: **exothermic**, heat is released (burning, neutralization, hand warmers);
- $\Delta H > 0$: **endothermic**, heat is absorbed (melting ice, instant cold packs, photosynthesis).

The value is given per mole of reaction as written:

$$
\text{CH}_4(g) + 2\,\text{O}_2(g) \longrightarrow \text{CO}_2(g) + 2\,\text{H}_2\text{O}(l), \qquad \Delta H = -890\ \text{kJ/mol}
$$

Double the equation, double $\Delta H$; reverse it, change its sign.

## Measuring heat: calorimetry

The heat $q$ that warms a mass $m$ of a substance with specific heat $c$ by $\Delta T$:

$$
q = m\,c\,\Delta T
$$

For water, $c = 4.18$ J/(g·K). Heating 1 L of water from 20 °C to 100 °C for tea takes $1000 \times 4.18 \times 80 = 334$ kJ, which burning about 0.38 mol (6 g) of methane would supply, if no heat were lost.

## Hess's law

Enthalpy is a **state function**: it depends only on the start and the end, not on the path. So $\Delta H$ of a reaction can be built from other reactions, or from tabulated **standard enthalpies of formation** $\Delta H_f^\circ$ (forming one mole of a compound from its elements in their standard states, which are 0 by definition):

$$
\Delta H^\circ = \sum \Delta H_f^\circ(\text{products}) - \sum \Delta H_f^\circ(\text{reactants})
$$

| Substance | $\Delta H_f^\circ$ (kJ/mol) |
|---|---|
| $\text{CH}_4(g)$ | −74.8 |
| $\text{CO}_2(g)$ | −393.5 |
| $\text{H}_2\text{O}(l)$ | −285.8 |
| $\text{H}_2\text{O}(g)$ | −241.8 |
| $\text{O}_2(g)$ | 0 |

For methane burning to liquid water:

$$
\Delta H^\circ = [-393.5 + 2(-285.8)] - [-74.8 + 0] = -890.3\ \text{kJ/mol}
$$

## Bond energies

Another estimate: breaking bonds costs energy, forming bonds releases it.

$$
\Delta H \approx \sum E(\text{bonds broken}) - \sum E(\text{bonds formed})
$$

| Bond | C–H | O=O | C=O (in CO₂) | O–H |
|---|---|---|---|---|
| kJ/mol | 413 | 498 | 799 | 463 |

For methane: broken $4(413) + 2(498) = 2648$; formed $2(799) + 4(463) = 3450$; so $\Delta H \approx 2648 - 3450 = -802$ kJ/mol. That matches the value for **gaseous** water ($-802.3$ from the formation enthalpies), as it should, since bond energies describe gases. The difference from −890 is the heat released when the steam condenses. Bond energies are averages over many molecules, so they give estimates, typically within some percent.

This also explains where the energy of fuels comes from: the bonds in $\text{CO}_2$ and $\text{H}_2\text{O}$ are stronger than those in the fuel and oxygen.

## Entropy and spontaneity

Exothermic reactions often happen on their own, but not always: ice melts at room temperature even though melting is endothermic. The second factor is **entropy**, $S$, a measure of the number of ways a system's energy and particles can be arranged. The second law of thermodynamics says the total entropy of the universe increases in any spontaneous process.

Entropy increases when solids melt, liquids evaporate, gases form, and substances dissolve or mix.

## Gibbs free energy

Josiah Willard Gibbs combined both factors into one quantity:

$$
\Delta G = \Delta H - T\Delta S
$$

A reaction is **spontaneous** (can happen without outside work) when $\Delta G < 0$.

| $\Delta H$ | $\Delta S$ | Spontaneous? |
|---|---|---|
| − | + | always |
| + | − | never |
| − | − | at low temperature |
| + | + | at high temperature |

**Example.** Ice melting: $\Delta H = +6.01$ kJ/mol, $\Delta S = +22.0$ J/(mol·K). It is spontaneous when $T\Delta S > \Delta H$, so above:

$$
T = \frac{\Delta H}{\Delta S} = \frac{6010}{22.0} \approx 273\ \text{K} = 0\ °\text{C}
$$

the melting point, as it should be. At exactly that temperature $\Delta G = 0$: ice and water are in equilibrium.

"Spontaneous" doesn't mean fast. Diamond turning into graphite has $\Delta G < 0$ at room conditions, but it is immeasurably slow. Speed is a separate question, the subject of the next page.

## Check yourself

1. Use the table to compute $\Delta H^\circ$ for $2\,\text{H}_2(g) + \text{O}_2(g) \to 2\,\text{H}_2\text{O}(l)$.
2. 50 g of water warms from 20 °C to 35 °C. How much heat did it absorb?
3. A reaction has $\Delta H = -50$ kJ/mol and $\Delta S = -100$ J/(mol·K). Above what temperature does it stop being spontaneous?
