# Welcome to the course

Chemistry is the science of matter and its changes: why iron rusts, how a battery stores energy, what happens when bread bakes or fuel burns. It is also a quantitative science: a chemist can say not only *what* happens, but *how much*, *how fast*, and *how far*.

This course teaches both sides: the ideas, and the calculations that make them useful.

## What you will learn

1. **Atoms and the periodic table**: protons, neutrons and electrons, isotopes, electron configurations, and the periodic trends.
2. **Chemical bonds**: ionic, covalent and metallic bonds, electronegativity, molecular shapes, polarity and intermolecular forces.
3. **Moles and reactions**: the mole, molar mass, empirical formulas, balancing equations, stoichiometry, limiting reagents and yield.
4. **Gases and solutions**: the ideal gas law, concentration, dilution.
5. **Energy, rates and equilibrium**: enthalpy, Hess's law, bond energies, entropy and Gibbs energy; rate laws and the Arrhenius equation; equilibrium constants and Le Chatelier's principle.
6. **Acids, bases and redox**: pH, weak acids, buffers and titrations; oxidation states, batteries, the Nernst equation and electrolysis.
7. **Project**: the chemistry of vinegar and baking soda, by the numbers.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages). Put them in one folder: `chem.js` and `balance.js` both use `elements.js`, a small periodic table.

```bash
node chem.js mass "Ca(OH)2" CuSO4.5H2O              # molar masses
node balance.js "C3H8 + O2 -> CO2 + H2O"            # balance an equation
node balance.js "N2 + H2 -> NH3" --have N2=28 H2=10  # limiting reagent and yield
node ph.js titrate 0.1 25 0.1 4.76                   # a titration curve
node physchem.js ice "H2 + I2 -> 2 HI" 1 1 0 49      # an equilibrium
```

Every output in the pages comes from running these scripts. Use them to check your own answers to the exercises, after you have worked them out by hand.

## What you need

No previous chemistry. The math is high-school algebra plus logarithms (for pH), which the course explains when they appear.

## A note on safety

Some pages mention common substances (acids, bleach, batteries). The calculations are for learning: don't mix household chemicals to test them. Bleach mixed with acids releases chlorine, and with ammonia, chloramines, both toxic. The only experiment suggested in this course, vinegar with baking soda, is safe.
