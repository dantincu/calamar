# The gas laws

Gases are the simplest state of matter: the molecules are far apart and move freely, so to a good approximation they behave the same whatever they are made of.

## The ideal gas law

Four quantities describe a gas: pressure $P$, volume $V$, amount $n$ and absolute temperature $T$. They are linked by:

$$
PV = nRT
$$

with the **gas constant** $R = 8.314$ J/(mol·K), which is also 8.314 kPa·L/(mol·K): convenient units for the lab. Temperature must be in **kelvin**: $T(\text{K}) = t(°\text{C}) + 273.15$.

The law combines older ones, each holding two quantities fixed:

| Law | Fixed | Relation |
|---|---|---|
| Boyle (1662) | $n$, $T$ | $PV$ = constant: squeeze a gas to half its volume, its pressure doubles |
| Charles | $n$, $P$ | $V \propto T$: a balloon shrinks in the freezer |
| Gay-Lussac | $n$, $V$ | $P \propto T$: tyre pressure rises on a hot day |
| Avogadro (1811) | $P$, $T$ | $V \propto n$: equal volumes contain equal numbers of molecules |

## Molar volume

At 0 °C and 1 atm (101.325 kPa), a mole of any ideal gas occupies 22.4 L; at 25 °C, 24.5 L:

```bash
node physchem.js gas P=? V=22.414 n=1 T=273.15
node physchem.js gas P=101.325 V=? n=1 T=298.15
```

```
PV = nRT:  P = 101.32 kPa, V = 22.414 L, n = 1.0000 mol, T = 273.15 K (0.00 °C)
PV = nRT:  P = 101.33 kPa, V = 24.464 L, n = 1.0000 mol, T = 298.15 K (25.00 °C)
```

Give the script any three quantities and a `?` for the fourth. How many moles of air are in your lungs (about 2 L at body temperature)?

```bash
node physchem.js gas P=101.325 V=2.0 n=? T=310
```

```
PV = nRT:  P = 101.33 kPa, V = 2.000 L, n = 0.0786 mol, T = 310.00 K (36.85 °C)
```

## Why the law works: kinetic theory

Picture a gas as tiny particles in constant random motion, bouncing off the walls. Pressure is the force of their collisions per unit area. The theory shows that the average kinetic energy of a molecule depends only on temperature:

$$
\tfrac{1}{2} m \overline{v^2} = \tfrac{3}{2} k_B T
$$

where $k_B = R / N_A = 1.381 \times 10^{-23}$ J/K is the Boltzmann constant. Solving for the root-mean-square speed:

$$
v_{\text{rms}} = \sqrt{\frac{3RT}{M}}
$$

with $M$ in kg/mol. For nitrogen at 25 °C: $\sqrt{3 \times 8.314 \times 298 / 0.028} \approx 515$ m/s, faster than a passenger jet. Light molecules move faster: hydrogen, at the same temperature, about 1,900 m/s, fast enough that Earth's gravity has let most of its free hydrogen escape to space.

## Mixtures: partial pressures

In a mixture, each gas contributes to the pressure as if it were alone (**Dalton's law**):

$$
P = P_1 + P_2 + \cdots, \qquad P_i = x_i P
$$

where $x_i$ is the mole fraction. Air is 21 % oxygen, so at sea level $P_{\text{O}_2} = 0.21 \times 101 \approx 21$ kPa. On the summit of Everest the total pressure is about a third of that at sea level, and so is the oxygen.

## When gases aren't ideal

The ideal law assumes molecules have no volume and don't attract each other. It fails at **high pressure** (the molecules are crowded) and **low temperature** (attractions matter, and gases condense). The **van der Waals equation** corrects for both:

$$
\left(P + \frac{a n^2}{V^2}\right)(V - nb) = nRT
$$

with $a$ for attraction and $b$ for the molecules' own volume, measured for each gas. At room conditions, the ideal law is accurate to better than 1 % for most gases.

## Check yourself

1. A 10 L tank of helium at 20 °C has a pressure of 15,000 kPa. How many moles does it hold? What volume would that be at 101 kPa and the same temperature?
2. A tyre is at 220 kPa (gauge, so 321 kPa absolute) at 10 °C. What is its absolute pressure at 40 °C?
3. How much faster is the rms speed of helium than that of oxygen at the same temperature?
