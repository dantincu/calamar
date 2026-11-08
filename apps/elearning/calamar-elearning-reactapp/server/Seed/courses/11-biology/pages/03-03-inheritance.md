# Mendelian inheritance

Gregor Mendel, a friar in Brno, crossed thousands of pea plants in the 1850s and 1860s and found that traits are inherited as discrete units, which we now call **genes**. His work, published in 1866, was ignored until 1900.

## Vocabulary

- A gene can come in different versions: **alleles**. Mendel's peas had a round-seed allele *R* and a wrinkled-seed allele *r*.
- Each individual has **two copies** of each gene (one from each parent): its **genotype**, such as *RR*, *Rr* or *rr*.
- **Homozygous**: two identical alleles (*RR*, *rr*). **Heterozygous**: two different (*Rr*).
- The **phenotype** is the observable trait. If *Rr* looks like *RR*, the allele *R* is **dominant** and *r* is **recessive**.

## The law of segregation

The two copies separate when eggs and sperm form (in meiosis), so each gamete carries **one** allele, chosen at random. Crossing two heterozygotes:

```bash
node genetics.js cross Aa Aa
```

```
Aa x Aa: 2 x 2 = 4 equally likely combinations

genotype   fraction
  AA       1/4
  Aa       2/4
  aa       1/4

phenotype (dominant trait shown in capitals)
  A        3/4
  a        1/4
```

The famous **3:1** ratio. Mendel counted 5,474 round and 1,850 wrinkled seeds in this cross, a ratio of 2.96 to 1.

Is that close enough to 3:1? The **chi-square test** measures the gap between observed ($O$) and expected ($E$) counts:

$$
\chi^2 = \sum \frac{(O - E)^2}{E}
$$

Of 7,324 seeds, 3/4 would be 5,493 round and 1,831 wrinkled:

$$
\chi^2 = \frac{(5474 - 5493)^2}{5493} + \frac{(1850 - 1831)^2}{1831} = 0.066 + 0.197 \approx 0.26
$$

well below 3.84, the critical value for one degree of freedom at the 5 % level. The data fit the theory. (In fact, statisticians since R. A. Fisher have noted that Mendel's results are, overall, a little *too* good, an unsolved historical puzzle.)

## The law of independent assortment

Genes on different chromosomes are inherited independently. Crossing two plants heterozygous for two genes:

```bash
node genetics.js cross AaBb AaBb
```

```
AaBb x AaBb: 4 x 4 = 16 equally likely combinations

phenotype (dominant trait shown in capitals)
  A B      9/16
  A b      3/16
  a B      3/16
  a b      1/16
```

The **9:3:3:1** ratio is just the 3:1 ratio twice: $(3/4 + 1/4)^2$ expanded. Probabilities of independent events multiply, so the chance of an *aabb* child is $\frac14 \times \frac14 = \frac{1}{16}$.

Genes that lie close together on the *same* chromosome don't assort independently: they are **linked**, and are separated only when the chromosomes exchange pieces during meiosis (**crossing over**). The frequency of these exchanges was used to make the first genetic maps.

## Beyond Mendel

Mendel chose traits controlled by single genes with clear dominance. Most traits are more complicated:

- **Incomplete dominance**: the heterozygote is in between (red × white snapdragons give pink).
- **Codominance**: both alleles show. In the ABO blood groups, A and B are codominant and both dominant over O, so an *AB* person has both antigens.
- **Sex linkage**: genes on the X chromosome. Men have one X, so a recessive allele there always shows. That is why red-green color blindness affects about 8 % of men of European descent but only about 0.5 % of women.
- **Polygenic traits**: height, skin color and most diseases depend on many genes plus the environment, and vary continuously.

### A medical example

Cystic fibrosis is recessive. Two carrier parents (*Cc* × *Cc*) have, for each child, a 1/4 chance of an affected child (*cc*), 1/2 of a carrier and 1/4 of a non-carrier. The chance that two children are both unaffected is $(3/4)^2 = 9/16$. Each child is a new, independent draw: having one affected child doesn't make the next one less likely to be affected.

## Check yourself

1. In a cross *Aa* × *aa*, what fraction of the offspring show the recessive trait? Check with `node genetics.js cross Aa aa`.
2. In *AaBbCc* × *AaBbCc*, what fraction show all three dominant traits? Compute it, then check with the script.
3. A man with red-green color blindness and a woman who isn't a carrier have a son. What is the chance he is color-blind? A daughter?
