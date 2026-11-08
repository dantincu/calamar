# Electric charge and Coulomb's law

## Charge

Rub a balloon on your hair and it attracts small bits of paper. The ancient Greeks noticed the same with amber, *ēlektron*, which gave electricity its name. Benjamin Franklin named the two kinds of charge **positive** and **negative**:

- like charges repel, unlike charges attract;
- charge is **conserved**: it is never created or destroyed, only moved (rubbing moves electrons from your hair to the balloon);
- charge is **quantized**: it comes in whole multiples of the elementary charge $e = 1.602 \times 10^{-19}$ C, carried by the proton ($+e$) and the electron ($-e$).

The unit is the **coulomb** (C). One coulomb is a lot: about $6.24 \times 10^{18}$ electrons. Static electricity involves nanocoulombs to microcoulombs.

## Conductors and insulators

In **conductors** (metals, salt water, the human body), some charges move freely: in metals, the outer electrons. In **insulators** (glass, plastic, dry air), charges stay put. **Semiconductors**, such as silicon, are in between, and their conductivity can be controlled, which is the basis of all electronics.

A charged object can attract a neutral one by **induction**: it pushes the like charges in the neutral object away and pulls the unlike charges closer, and the closer charges win. That is why the balloon sticks to the wall.

## Coulomb's law

Charles-Augustin de Coulomb measured the force between charges in 1785 with a torsion balance. It is proportional to both charges and inversely proportional to the square of their distance, like gravity:

$$
F = k\frac{q_1 q_2}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} = 8.99 \times 10^9\ \text{N m}^2/\text{C}^2
$$

where $\varepsilon_0 = 8.854 \times 10^{-12}$ F/m is the **permittivity of free space**. A positive $F$ means repulsion. The force acts along the line between the charges.

```bash
node em.js coulomb 1e-6 -2e-6 0.05
```

```
F = k q1 q2 / r² = 8.9876e+9 x 0.000001 x -0.000002 / 0.05² = -7.190 N (attractive)
```

Two microcoulombs 5 cm apart pull with 7 N, the weight of 700 g. When several charges act on one, their forces add as vectors (the **superposition principle**).

## Electricity versus gravity

Compare the electric and gravitational forces between a proton and an electron. Both go as $1/r^2$, so the distance cancels:

$$
\frac{F_e}{F_g} = \frac{k e^2}{G m_p m_e} = \frac{8.99 \times 10^9 \times (1.602 \times 10^{-19})^2}{6.674 \times 10^{-11} \times 1.673 \times 10^{-27} \times 9.109 \times 10^{-31}} \approx 2.3 \times 10^{39}
$$

Electricity is unimaginably stronger. Gravity dominates the universe at large only because matter is almost exactly neutral, so electric forces cancel. Everything you touch, every chemical bond and the solidity of your chair, is electric.

Inside an atomic nucleus, two protons are about $10^{-15}$ m apart:

```bash
node em.js coulomb 1.602e-19 1.602e-19 1e-15
```

```
F = k q1 q2 / r² = 8.9876e+9 x 1.602e-19 x 1.602e-19 / 1e-15² = 230.7 N (repulsive)
```

230 N on a particle of $10^{-27}$ kg. Something stronger must hold nuclei together: the **strong nuclear force**, which acts only at such short distances.

## Check yourself

1. How many electrons must a balloon gain to carry a charge of $-50$ nC?
2. Two equal charges 10 cm apart repel with 0.9 N. What is each charge?
3. A charge of $+1$ µC sits halfway between $+2$ µC and $-2$ µC charges placed 20 cm apart. What is the net force on it, and in which direction?
