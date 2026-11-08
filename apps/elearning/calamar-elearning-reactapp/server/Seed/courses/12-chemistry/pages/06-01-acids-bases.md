# Acids, bases and pH

## What acids and bases are

In the **Brønsted-Lowry** definition (1923), an **acid** donates a proton ($\text{H}^+$) and a **base** accepts one. When hydrochloric acid dissolves in water, it gives its proton to a water molecule:

$$
\text{HCl} + \text{H}_2\text{O} \longrightarrow \text{H}_3\text{O}^+ + \text{Cl}^-
$$

The hydronium ion $\text{H}_3\text{O}^+$ is usually written simply as $\text{H}^+$. Every acid has a **conjugate base**, what is left after it gives up its proton ($\text{Cl}^-$ for HCl, acetate for acetic acid), and every base a conjugate acid.

## Water and the pH scale

Water itself ionizes very slightly:

$$
\text{H}_2\text{O} \rightleftharpoons \text{H}^+ + \text{OH}^-, \qquad K_w = [\text{H}^+][\text{OH}^-] = 1.0 \times 10^{-14} \text{ at 25 °C}
$$

In pure water $[\text{H}^+] = [\text{OH}^-] = 10^{-7}$ M. Since concentrations of $\text{H}^+$ span many powers of ten, chemists use a logarithmic scale, the **pH** (Søren Sørensen, 1909):

$$
\text{pH} = -\log_{10}[\text{H}^+], \qquad \text{pH} + \text{pOH} = 14
$$

pH 7 is neutral; below 7, acidic; above 7, basic. Each unit is a factor of 10: pH 3 is ten times more acidic than pH 4.

| Substance | pH |
|---|---|
| stomach acid | 1–2 |
| lemon juice | about 2 |
| vinegar | about 2.5–3 |
| coffee | about 5 |
| pure water | 7 |
| blood | 7.35–7.45 |
| sea water | about 8.1 |
| baking soda solution | about 8.3 |
| household ammonia | about 11.5 |
| bleach | about 12.5 |

## Strong acids and bases

**Strong** acids (HCl, $\text{HNO}_3$, $\text{H}_2\text{SO}_4$ for its first proton) and bases (NaOH, KOH) dissociate completely, so the pH follows directly:

```bash
node ph.js strong-acid 0.01
node ph.js strong-base 0.01
```

```
[H+] = 1.000e-2 mol/L, pH = 2.00  (simple estimate: -log 0.01 = 2.00)
[OH-] = 0.01 mol/L, pOH = 2.00, pH = 14 - pOH = 12.00
```

A trap: what is the pH of $10^{-8}$ M HCl? Not 8, which would be basic! At such low concentrations the water's own $\text{H}^+$ matters. The script solves the full charge balance:

```bash
node ph.js strong-acid 1e-8
```

```
[H+] = 1.051e-7 mol/L, pH = 6.98  (simple estimate: -log 1e-8 = 8.00)
```

## Weak acids

**Weak** acids, such as acetic acid (in vinegar) or citric acid (in lemons), dissociate only partly:

$$
\text{HA} \rightleftharpoons \text{H}^+ + \text{A}^-, \qquad K_a = \frac{[\text{H}^+][\text{A}^-]}{[\text{HA}]}, \qquad \text{p}K_a = -\log_{10} K_a
$$

A smaller $K_a$, or larger $\text{p}K_a$, means a weaker acid. Acetic acid has $\text{p}K_a = 4.76$. When only a small fraction dissociates, $[\text{H}^+] \approx \sqrt{K_a c}$:

```bash
node ph.js weak-acid 0.1 4.76
```

```
Ka = 10^-4.76 = 1.738e-5
exact:  [H+] = 1.310e-3, pH = 2.88
approx: [H+] = sqrt(Ka C) = 1.318e-3, pH = 2.88
fraction dissociated: 1.31 %
```

Only 1.3 % of the molecules are dissociated. A 0.1 M solution of HCl would have pH 1: same concentration, nearly 80 times more $\text{H}^+$. Dilute the acetic acid to 0.001 M and the fraction dissociated rises to 12 %: weak acids dissociate *more* when diluted (Le Chatelier again).

## Buffers

A **buffer** is a mixture of a weak acid and its conjugate base. It resists changes in pH: added acid is taken up by the base, added base by the acid. Its pH follows from $K_a$, rearranged as the **Henderson-Hasselbalch equation**:

$$
\text{pH} = \text{p}K_a + \log_{10}\frac{[\text{A}^-]}{[\text{HA}]}
$$

```bash
node ph.js buffer 4.76 0.1 0.1
node ph.js buffer 4.76 0.1 0.05
```

```
pH = pKa + log([A-]/[HA]) = 4.76 + log(0.1/0.1) = 4.76
pH = pKa + log([A-]/[HA]) = 4.76 + log(0.05/0.1) = 4.46
```

Halving the base changes the pH by only 0.3. Your **blood** is buffered mainly by carbonic acid and bicarbonate. With an effective $\text{p}K_a$ of 6.1, a bicarbonate concentration of 24 mM, and dissolved CO₂ of about 1.2 mM:

$$
\text{pH} = 6.1 + \log_{10}\frac{24}{1.2} = 6.1 + 1.30 = 7.40
$$

Breathing controls the CO₂ term, and the kidneys the bicarbonate: two systems that keep blood pH within a few hundredths of 7.4.

## Titration

A **titration** measures the amount of an acid by adding a base of known concentration until it is exactly neutralized, the **equivalence point**, usually seen with an indicator dye that changes color.

```bash
node ph.js titrate 0.1 25 0.1 4.76
```

```
25 mL of 0.1 M weak acid (pKa 4.76) with 0.1 M NaOH: equivalence at 25.00 mL

  NaOH mL    pH
     0.00   2.88
     2.50   3.81
     6.25   4.28
    12.50   4.76   half-way: pH = pKa
    18.75   5.24
    22.50   5.71
    24.75   6.76
    25.00   8.73   equivalence point
    25.25  10.70
    27.50  11.68
    37.50  12.30
    50.00  12.52
```

Three features to notice:

- the flat **buffer region** in the middle, where acid and acetate coexist;
- at **half-way**, $[\text{HA}] = [\text{A}^-]$, so $\text{pH} = \text{p}K_a$: a titration measures $\text{p}K_a$ too;
- at the **equivalence point**, the pH is about 8.7, not 7, because acetate is a weak base. So the indicator must change color around pH 8–9: **phenolphthalein** (colorless to pink) is the right choice.

With a strong acid instead (`node ph.js titrate 0.1 25 0.1`, no $\text{p}K_a$), the curve starts at pH 1, has no buffer region, and jumps through pH 7 at the equivalence point.

## Check yourself

1. What is the pH of 0.005 M NaOH?
2. Lemon juice has pH 2.3 and coffee pH 5.0. How many times more $\text{H}^+$ is in lemon juice?
3. You want an acetate buffer at pH 5.06. What ratio of acetate to acetic acid do you need?
