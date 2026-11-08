# Reaction rates

Thermodynamics says whether a reaction can happen; **kinetics** says how fast. Explosions take microseconds, rusting takes years.

## The rate and what affects it

The **rate** of a reaction is the change in concentration per unit time. For molecules to react they must **collide**, with **enough energy** and in the **right orientation** (collision theory). So the rate increases with:

- **concentration** (or pressure, for gases): more collisions;
- **surface area**: flour dust can explode, a bag of flour only burns;
- **temperature**: faster molecules, and many more of them with enough energy;
- a **catalyst**: a lower energy barrier.

## Rate laws

For a reaction $\text{A} + \text{B} \to$ products, experiments typically give a **rate law** of the form:

$$
\text{rate} = k\,[\text{A}]^m [\text{B}]^n
$$

where $k$ is the **rate constant** and $m$, $n$ are the **orders**, found by experiment (they are not, in general, the coefficients of the equation). If doubling $[\text{A}]$ doubles the rate, $m = 1$; if it quadruples it, $m = 2$.

## First-order reactions and half-lives

When the rate is proportional to one concentration, $d[\text{A}]/dt = -k[\text{A}]$, the concentration decays exponentially:

$$
[\text{A}] = [\text{A}]_0\, e^{-kt}, \qquad t_{1/2} = \frac{\ln 2}{k}
$$

The **half-life** $t_{1/2}$ is constant: whatever the starting amount, half is left after one half-life, a quarter after two. Radioactive decay is first order. Carbon-14 has a half-life of 5,730 years:

```bash
node physchem.js halflife 5730 1000 0.25
```

```
k = ln 2 / t½ = 1.2097e-4 per unit time
after 1000: fraction left = e^(-kt) = (1/2)^(t/t½) = 0.8861
fraction 0.25 left after t = ln(1/fraction) / k = 11460
```

A living organism keeps the same ¹⁴C fraction as the atmosphere; after death, the ¹⁴C decays. A bone with a quarter of the original ¹⁴C is two half-lives old, about 11,460 years. (Real radiocarbon dates are corrected with calibration curves, because the atmospheric fraction has varied.)

## The Arrhenius equation

Svante Arrhenius (1889) found how the rate constant depends on temperature:

$$
k = A\, e^{-E_a / RT}
$$

where $E_a$ is the **activation energy**, the barrier to climb, and $A$ a factor for the collision frequency and orientation. The factor $e^{-E_a/RT}$ is the fraction of collisions with enough energy. Comparing two temperatures:

$$
\frac{k_2}{k_1} = \exp\!\left[-\frac{E_a}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)\right]
$$

```bash
node physchem.js arrhenius 50 298 308
node physchem.js arrhenius 50 277 298
```

```
k(T2)/k(T1) = exp(-Ea/R (1/T2 - 1/T1)) = 1.926: 1.93 times as fast at 308 K as at 298 K
k(T2)/k(T1) = exp(-Ea/R (1/T2 - 1/T1)) = 4.618: 4.62 times as fast at 298 K as at 277 K
```

For a typical activation energy of 50 kJ/mol, a 10 °C rise roughly **doubles** the rate: the old rule of thumb. And food spoilage reactions with similar barriers run about 4–5 times slower in a fridge at 4 °C than on a counter at 25 °C. (Bacterial growth slows even more, which is the main point of the fridge.)

## Catalysts

A **catalyst** speeds a reaction by providing a different path with a lower activation energy, and is recovered unchanged. It speeds the forward and the reverse reactions equally, so it doesn't change where the equilibrium lies: it only gets there faster.

- **Enzymes** are biological catalysts (see *Biology Essentials*).
- A car's **catalytic converter** uses platinum, palladium and rhodium to turn CO, unburnt fuel and nitrogen oxides into CO₂, water and N₂.
- The **Haber-Bosch** process uses an iron catalyst to make ammonia from N₂ and H₂.

How much does a catalyst help? Lowering $E_a$ by 20 kJ/mol multiplies the rate at 25 °C by $e^{20000/(8.314 \times 298)} \approx 3{,}200$.

## Check yourself

1. A drug is eliminated by first-order kinetics with a half-life of 6 hours. What fraction is left after 24 hours?
2. If the rate of a reaction triples between 25 °C and 40 °C, what is its activation energy? (Solve the two-temperature formula for $E_a$, or try values with the script.)
3. Why does a catalyst not change the equilibrium of a reaction?
