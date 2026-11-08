# Redox reactions and electrochemistry

## Oxidation and reduction

In a **redox** reaction, electrons move from one substance to another:

- **oxidation** is the loss of electrons;
- **reduction** is the gain of electrons.

(Mnemonic: **OIL RIG**, Oxidation Is Loss, Reduction Is Gain.) They always happen together. Put a zinc strip in copper sulfate solution, and it becomes coated with copper while the blue color fades:

$$
\text{Zn}(s) + \text{Cu}^{2+}(aq) \longrightarrow \text{Zn}^{2+}(aq) + \text{Cu}(s)
$$

Zinc is oxidized (loses 2 electrons), copper ions are reduced (gain 2). Zinc is the **reducing agent**, copper ions the **oxidizing agent**.

## Oxidation states

To track electrons in molecules, chemists assign **oxidation states**, as if every bond were ionic:

1. an element on its own is 0 (Zn, $\text{O}_2$, $\text{Cl}_2$);
2. a simple ion has its charge ($\text{Na}^+$ is +1);
3. oxygen is usually −2, hydrogen +1 (with non-metals), fluorine always −1;
4. the states add up to the charge of the molecule or ion.

In $\text{KMnO}_4$: $+1 + x + 4(-2) = 0$, so manganese is +7. In the reaction of the stoichiometry page, $2\,\text{KMnO}_4 + 16\,\text{HCl} \to \dots + 2\,\text{MnCl}_2 + 5\,\text{Cl}_2$, manganese goes from +7 to +2 (gaining 5 electrons) and chlorine from −1 to 0. Ten electrons move in all: 2 Mn × 5 = 10 Cl × 1. The coefficients the script found are the ones that balance the electrons.

Burning, rusting, respiration and photosynthesis are all redox reactions.

## Galvanic cells: batteries

If the two halves of a redox reaction are kept apart and connected by a wire, the electrons flow through the wire: a **galvanic cell**, the principle of every battery. In the **Daniell cell**, a zinc electrode in zinc sulfate is connected to a copper electrode in copper sulfate, with a salt bridge between the solutions.

- The **anode** is where oxidation happens (zinc dissolves).
- The **cathode** is where reduction happens (copper deposits).

## Standard potentials

Each half-reaction has a **standard reduction potential** $E^\circ$, measured against the hydrogen electrode (0 V by definition). Higher means a stronger tendency to be reduced:

| Half-reaction | $E^\circ$ (V) |
|---|---|
| $\text{Li}^+ + e^- \to \text{Li}$ | −3.04 |
| $\text{Zn}^{2+} + 2e^- \to \text{Zn}$ | −0.76 |
| $\text{Fe}^{2+} + 2e^- \to \text{Fe}$ | −0.44 |
| $2\text{H}^+ + 2e^- \to \text{H}_2$ | 0.00 |
| $\text{Cu}^{2+} + 2e^- \to \text{Cu}$ | +0.34 |
| $\text{Ag}^+ + e^- \to \text{Ag}$ | +0.80 |
| $\text{O}_2 + 4\text{H}^+ + 4e^- \to 2\text{H}_2\text{O}$ | +1.23 |

The cell voltage is the difference, and the voltage gives the free energy:

$$
E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}}, \qquad \Delta G^\circ = -nFE^\circ_{\text{cell}}
$$

where $n$ is the number of electrons transferred and $F = 96\,485$ C/mol is the **Faraday constant**, the charge of a mole of electrons.

```bash
node physchem.js cell 0.34 -0.76 2 1 1
```

```
E°cell = E°cathode - E°anode = 0.34 - (-0.76) = 1.100 V
ΔG° = -nFE° = -2 x 96485 x 1.100 = -212.3 kJ/mol
K = exp(nFE°/RT) = 1.55e+37
Nernst at 25 °C, Q = 1: E = E° - (0.0592/n) log Q = 1.100 V
```

An equilibrium constant of $10^{37}$: the reaction goes to completion. Lithium, at the bottom of the table, gives up electrons most readily, and it is also the lightest metal: that is why lithium batteries store so much energy per kilogram.

## The Nernst equation

Away from standard conditions (1 M solutions), the voltage changes with the concentrations, through the reaction quotient $Q$:

$$
E = E^\circ - \frac{RT}{nF}\ln Q = E^\circ - \frac{0.0592\ \text{V}}{n}\log_{10} Q \quad \text{(at 25 °C)}
$$

For the Daniell cell, $Q = [\text{Zn}^{2+}]/[\text{Cu}^{2+}]$. The script takes the two concentrations, the anode's ion first:

```bash
node physchem.js cell 0.34 -0.76 2 0.01 1
node physchem.js cell 0.34 -0.76 2 1 0.01
```

```
Nernst at 25 °C, Q = 0.01: E = E° - (0.0592/n) log Q = 1.159 V
Nernst at 25 °C, Q = 100: E = E° - (0.0592/n) log Q = 1.041 V
```

As the cell runs, $\text{Zn}^{2+}$ builds up and $\text{Cu}^{2+}$ is used up, so $Q$ grows and the voltage falls slowly, reaching zero at equilibrium: a "flat" battery. It is the same equation as the Nernst potential of nerve cells in *Biology Essentials*.

## Electrolysis

Pushing current the other way drives a non-spontaneous reaction: **electrolysis**. It is how aluminium, chlorine and sodium hydroxide are made, how metals are electroplated, and how a phone battery is recharged. The amount of product follows from the charge passed, $Q = It$ (Faraday's laws):

$$
m = \frac{It}{zF}\,M
$$

**Example.** Aluminium is made by electrolysis of molten aluminium oxide ($\text{Al}^{3+}$, so $z = 3$). How much current produces 1 kg per hour?

$$
I = \frac{m z F}{M t} = \frac{1000 \times 3 \times 96\,485}{26.98 \times 3600} \approx 3\,000\ \text{A}
$$

Real smelters run cells at several hundred thousand amperes, which is why aluminium plants are built next to cheap electricity and why recycling aluminium saves about 95 % of the energy.

## Check yourself

1. What is the oxidation state of sulfur in $\text{H}_2\text{SO}_4$ and in $\text{H}_2\text{S}$?
2. Compute $E^\circ$ for a cell made of silver and copper electrodes. Which metal is the anode?
3. Iron rusts, but zinc-coated (galvanized) steel resists rust even where the coating is scratched. Use the table to explain why.
