# Population genetics: selection and drift

Evolution, in the genetic sense, is a change in **allele frequencies** over generations. This page gives the basic model, and then simulates the two forces that change frequencies the most: selection and drift.

## Allele frequencies

Take a gene with two alleles, *A* and *a*, with frequencies $p$ and $q$, where $p + q = 1$. In a sample of $n$ people with counts $n_{AA}$, $n_{Aa}$ and $n_{aa}$, each person carries two copies, so:

$$
p = \frac{2n_{AA} + n_{Aa}}{2n}, \qquad q = 1 - p
$$

## The Hardy-Weinberg equilibrium

In 1908, G. H. Hardy and Wilhelm Weinberg showed that, if nothing changes the frequencies (no selection, mutation, migration or drift, and random mating), they stay the same forever, and the genotypes settle in one generation at:

$$
p^2 + 2pq + q^2 = 1
$$

that is, $p^2$ are *AA*, $2pq$ are *Aa* and $q^2$ are *aa*. Picking two gametes at random is like picking two letters independently, each *A* with probability $p$.

This equilibrium is the "null model" of population genetics: when a population departs from it, something is going on. The script tests a sample:

```bash
node genetics.js hw 298 489 213
```

```
n = 1000 individuals, p(A) = 0.5425, q(a) = 0.4575

genotype  observed  expected
  AA         298     294.3
  Aa         489     496.4
  aa         213     209.3

chi-square = 0.221 with 1 degree of freedom (critical value 3.841 at the 5 % level)
consistent with Hardy-Weinberg equilibrium
```

(One degree of freedom, not two: three classes, minus one because the counts add up to $n$, minus one because $p$ was estimated from the data.) A sample with too few heterozygotes fails the test:

```bash
node genetics.js hw 60 20 20
```

```
chi-square = 27.438 with 1 degree of freedom (critical value 3.841 at the 5 % level)
NOT in Hardy-Weinberg equilibrium: something (selection, non-random mating, migration...) is going on
```

A shortage of heterozygotes is typical of inbreeding, or of a sample that mixes two populations with different frequencies.

### A practical use: carrier frequency

Cystic fibrosis affects about 1 in 2,500 newborns of European descent. If affected people are *aa*, then $q^2 = 1/2500$, so $q = 0.02$ and $p = 0.98$. The carriers are:

$$
2pq = 2 \times 0.98 \times 0.02 \approx 0.039
$$

about **1 person in 25**: a recessive allele hides mostly in healthy carriers.

## Selection

Give each genotype a **fitness** $w$, its relative chance of surviving and reproducing. After selection, the frequency of *A* in the next generation is:

$$
p' = \frac{p^2 w_{AA} + pq\, w_{Aa}}{\bar w}, \qquad \bar w = p^2 w_{AA} + 2pq\, w_{Aa} + q^2 w_{aa}
$$

where $\bar w$ is the mean fitness. A new dominant allele that gives a 10 % advantage (*aa* has fitness 0.9):

```bash
node genetics.js select 0.01 1 1 0.9 200
```

```
generation   p(A)     q(a)    mean fitness
     0     0.0100   0.9900   0.9020
    20     0.0721   0.9279   0.9139
    40     0.3065   0.6935   0.9519
    60     0.5805   0.4195   0.9824
   100     0.8127   0.1873   0.9965
   200     0.9302   0.0698   0.9995
```

From 1 % to more than 90 % in 200 generations, about 5,000 years for humans, very fast in evolutionary time. But notice the slowdown at the end: when *a* is rare, it hides in heterozygotes, where selection can't see it. That is why harmful recessive alleles are so hard to eliminate.

When the **heterozygote is the fittest**, selection keeps both alleles. The final project uses this case.

## Genetic drift

In a finite population, the next generation is a random sample of the gene copies of this one, and random samples wander. The **Wright-Fisher model** draws each of the $2N$ gene copies at random, with probability $p$:

```bash
node genetics.js drift 0.5 20 100 8
```

```
Wright-Fisher drift: N = 20 individuals (40 gene copies), p0 = 0.5, no selection, seed 42

run      g0    g1    g2    g5   g10   g20   g50  g100
  1    0.50  0.53  0.53  0.57  0.53  0.30  0.00  0.00
  2    0.50  0.55  0.50  0.50  0.47  0.38  0.20  0.00
  3    0.50  0.63  0.75  0.70  0.90  0.82  0.07  0.00
  4    0.50  0.42  0.33  0.17  0.28  0.03  0.00  0.00
  5    0.50  0.60  0.63  0.65  0.82  1.00  1.00  1.00
  6    0.50  0.45  0.45  0.17  0.05  0.00  0.00  0.00
  7    0.50  0.42  0.60  0.57  0.55  0.38  0.38  0.38
  8    0.50  0.60  0.63  0.55  0.80  1.00  1.00  1.00

after 100 generations: A fixed in 2 runs, lost in 5, still polymorphic in 1
expected heterozygosity left: H_t/H_0 = (1 - 1/2N)^t = 0.080
```

With no selection at all, in 7 of 8 small populations one allele has disappeared after 100 generations. On average, drift removes genetic variation at the rate:

$$
H_t = H_0 \left(1 - \frac{1}{2N}\right)^t
$$

where $H$ is the heterozygosity (the chance that two random gene copies differ). With 500 individuals instead of 20 (`node genetics.js drift 0.5 500 100 4`), all four populations still have both alleles after 100 generations, with 90 % of the variation left.

The consequences are real:

- **Bottlenecks**: northern elephant seals were hunted down to perhaps 20–30 animals in the 1890s. They recovered to more than 100,000, but with very little genetic variation.
- **Founder effects**: a small group that founds a new population carries only a sample of the original alleles. Some rare diseases are common in isolated communities for this reason, such as Ellis-van Creveld syndrome among the Old Order Amish of Pennsylvania.

## Check yourself

1. A recessive disease affects 1 in 10,000 people. What fraction are carriers?
2. Run `node genetics.js select 0.01 1 0.95 0.9 200`, where the advantage is partly dominant. Is the spread faster or slower than above? Why?
3. Run the drift model with $N = 20$ and different seeds. Out of many runs, how often is *A* fixed if $p_0 = 0.2$? (Theory says: with probability $p_0$.)
