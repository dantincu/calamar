# Enzymes

Most reactions in a cell would be far too slow at body temperature without help. **Enzymes**, nearly all of them proteins, are catalysts: they speed reactions up, often by a factor of millions or more, without being used up.

## How an enzyme works

An enzyme has a pocket, the **active site**, that fits its **substrate** (the molecule it acts on). The enzyme binds the substrate, holds it in a shape and environment where the reaction is easier, releases the **product**, and is ready for the next one:

$$
E + S \;\rightleftharpoons\; ES \;\longrightarrow\; E + P
$$

In energy terms, an enzyme **lowers the activation energy**, the energy barrier the molecules must climb to react. It doesn't change the overall energy difference between substrate and product, so it can't make an unfavorable reaction happen on its own: it only makes a possible one fast.

Enzymes are **specific** (each catalyzes one reaction or a few), and they work best at a particular **temperature** and **pH**. Too hot and they denature. Pepsin in the stomach works best at pH about 2; most enzymes in the blood near pH 7.4.

## Michaelis-Menten kinetics

How fast does an enzyme work as you add substrate? With little substrate, the rate rises in proportion: double the substrate, double the rate. With a lot, every enzyme molecule is busy, and the rate levels off at a maximum $V_{\max}$. The **Michaelis-Menten equation** (1913) describes this curve:

$$
v = \frac{V_{\max}[S]}{K_m + [S]}
$$

- $v$ is the reaction rate, and $[S]$ the substrate concentration;
- $V_{\max}$ is the maximum rate, when the enzyme is saturated;
- $K_m$, the **Michaelis constant**, is the substrate concentration at which the rate is half the maximum. Put $[S] = K_m$ into the formula: $v = V_{\max}/2$. A small $K_m$ means the enzyme reaches half speed at low substrate concentration.

```bash
node enzymes.js curve 10 2
```

```
v = Vmax [S] / (Km + [S]), Vmax = 10, Km = 2

   [S]       v    % of Vmax
  0.25    1.11      11 %
  0.50    2.00      20 %
  1.00    3.33      33 %
  2.00    5.00      50 %
  4.00    6.67      67 %
  8.00    8.00      80 %
 16.00    8.89      89 %
 32.00    9.41      94 %
100.00    9.80      98 %
```

Notice the diminishing returns: going from $K_m$ to $4K_m$ takes the rate from 50 % to 80 %, and the last few percent need huge concentrations.

## Measuring $V_{\max}$ and $K_m$

In the lab you measure $v$ at a few substrate concentrations. Taking the reciprocal of both sides turns the curve into a straight line, the **Lineweaver-Burk** plot:

$$
\frac{1}{v} = \frac{K_m}{V_{\max}} \cdot \frac{1}{[S]} + \frac{1}{V_{\max}}
$$

Plot $1/v$ against $1/[S]$: the intercept is $1/V_{\max}$ and the slope is $K_m/V_{\max}$. The script fits the line by least squares:

```bash
node enzymes.js fit 0.5:2.0 1:3.3 2:5.0 4:6.7 8:8.0
```

```
line: 1/v = 0.2005 (1/[S]) + 0.1001
Vmax = 1/intercept = 9.99, Km = slope x Vmax = 2.00
```

(Today, biochemists usually fit the curve directly with non-linear regression, because taking reciprocals magnifies the errors of the slowest measurements. The straight line is still the clearest way to see what the two constants mean.)

## Inhibitors

Many drugs and poisons work by **inhibiting** enzymes:

- a **competitive** inhibitor resembles the substrate and occupies the active site. Enough substrate outcompetes it: $V_{\max}$ is unchanged, but $K_m$ appears larger, multiplied by $\alpha = 1 + [I]/K_i$;
- a **non-competitive** inhibitor binds elsewhere and disables part of the enzyme: $V_{\max}$ falls by the factor $\alpha$, whatever the substrate concentration.

```bash
node enzymes.js inhibit 10 2 1 0.5
```

```
   [S]   none   competitive   non-competitive
   0.5   2.00          0.77              0.67
     2   5.00          2.50              1.67
    20   9.09          7.69              3.03
   100   9.80          9.43              3.27
```

Examples: statins competitively inhibit HMG-CoA reductase, an enzyme in the body's cholesterol synthesis; ethanol is given for methanol poisoning because it competes for the enzyme (alcohol dehydrogenase) that would turn methanol into toxic formaldehyde.

## Check yourself

1. At what substrate concentration, in units of $K_m$, does an enzyme reach 90 % of $V_{\max}$? (Solve $0.9 = [S]/(K_m + [S])$.)
2. Why can a high dose of substrate overcome a competitive inhibitor but not a non-competitive one?
3. Run `node enzymes.js fit` with your own invented data that include some noise. How sensitive are the estimates to an error in the lowest concentration?
