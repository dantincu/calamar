# Sickle cell: from gene to population

**Sickle-cell disease** was the first disease to be explained at the level of a molecule (Linus Pauling and colleagues, 1949, "Sickle cell anemia, a molecular disease"). Its story connects every chapter of this course. You need `dna.js` and `genetics.js`.

## 1. The DNA

Take the start of the *HBB* gene from the gene-expression page, and change base 20, the middle letter of codon 7, from A to T:

```bash
node dna.js mutate ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGG 20 T
```

```
before  ATG GTG CAC CTG ACT CCT GAG GAG AAG ...
after   ATG GTG CAC CTG ACT CCT GTG GAG AAG ...
protein before  MVHLTPEEKSAVTALWGKVNVDEVGGEALGR
protein after   MVHLTPVEKSAVTALWGKVNVDEVGGEALGR
effect: missense (Glu7Val)
```

One letter out of about 3 billion: GAG becomes GTG, and **glutamate becomes valine** at position 6 of the mature protein (7 counting the start methionine). The normal allele is called *HbA*, the sickle allele *HbS*.

## 2. The protein

Glutamate is charged and likes water; valine is hydrophobic. On the surface of hemoglobin, the new valine forms a sticky patch. When the hemoglobin releases its oxygen, the sticky patch of one molecule fits into a pocket of another, and the molecules link up into long, stiff **fibers**: an effect of the protein's 3D structure (the macromolecules page) caused by a change in its primary structure.

## 3. The cell and the patient

The fibers deform the red blood cells into rigid **sickle** shapes. Sickled cells:

- block small blood vessels, causing episodes of severe pain and damage to organs (remember: capillaries are barely wider than a red cell);
- are destroyed quickly, after about 10–20 days instead of the normal 120, causing anemia.

Inheritance follows Mendel. People with two copies (*SS*) have the disease. People with one copy (*AS*) have **sickle-cell trait**: they are usually healthy, because half their hemoglobin is normal. Two carrier parents:

```bash
node genetics.js cross AS AS
```

```
AS x AS: 2 x 2 = 4 equally likely combinations

genotype   fraction
  AA       1/4
  AS       2/4
  SS       1/4
```

Each child of two carriers has a 1 in 4 chance of the disease. (The script also prints a phenotype ratio that assumes the first allele is fully dominant. Ignore it here: as you will see, *AS* differs from *AA* in an important way.)

## 4. The population

Without modern care, many children with sickle-cell disease used to die young. Selection against the *S* allele was strong, so why is it common? In parts of sub-Saharan Africa its frequency exceeds 10 % (Piel and colleagues mapped it in 2010), and it is also frequent in parts of the Middle East and India.

The answer, proposed by Anthony Allison in 1954: the regions where *HbS* is common are where **malaria** was common. Carriers (*AS*) are strongly protected against severe malaria, because infected cells sickle and are removed. So:

| Genotype | Malaria | Sickle-cell disease | Relative fitness (illustrative) |
|---|---|---|---|
| *AA* | vulnerable | no | $1 - s$ |
| *AS* | protected | no | 1 |
| *SS* | protected | yes | $1 - t$ |

This is **heterozygote advantage**. Selection removes *S* alleles in *SS* children and *A* alleles in *AA* children who die of malaria, and the frequency settles where the two losses balance. Setting $p' = p$ in the selection formula of the population genetics page gives the equilibrium:

$$
q^* = \frac{s}{s + t}
$$

With illustrative values $s = 0.1$ (a 10 % malaria cost for *AA*) and $t = 0.8$ (an 80 % cost of the disease without modern care):

```bash
node genetics.js select 0.5 0.9 1 0.2 50
```

```
fitness AA 0.9, Aa 1, aa 0.2; p(A) at the start 0.5

generation   p(A)     q(a)    mean fitness
     0     0.5000   0.5000   0.7750
     5     0.7843   0.2157   0.9013
    10     0.8427   0.1573   0.9092
    20     0.8757   0.1243   0.9110
    30     0.8845   0.1155   0.9111
    50     0.8883   0.1117   0.9111

heterozygote advantage: equilibrium p(A) = t/(s+t) = 0.8889, q(a) = s/(s+t) = 0.1111
```

(Here *a* is the *S* allele.) The model settles at $q \approx 0.11$, in the range seen in high-malaria regions. Start from a rare *S* allele, `node genetics.js select 0.99 0.9 1 0.2 200`, and it climbs to the same equilibrium: selection itself maintains the allele.

## 5. Your turn

**Exercise 1.** Where malaria has been eliminated, *AA* people lose their disadvantage ($s = 0$). Model it with `node genetics.js select 0.89 1 1 0.2 200`. What happens to the *S* allele, and how fast? Why does it decline slowly once it is rare?

**Exercise 2.** In a population at the equilibrium above, what fraction of people are carriers ($2pq$)? What fraction of births are affected ($q^2$)? Check the second against the published figure for some high-prevalence countries: about 1–2 % of births.

**Exercise 3.** Use `node dna.js mutate` to find another single-base change at codon 7 that gives a *different* amino acid. (A real one, GAG→AAG, gives lysine: the *HbC* variant, which also protects against malaria.)

**Exercise 4.** Today, treatments (hydroxyurea, blood transfusions) and, since 2023, gene therapies, including the first approved therapy based on CRISPR gene editing, have changed the outlook for patients. How would better survival of *SS* people change $t$, and the equilibrium?

## What this shows

One changed DNA letter alters a protein's surface, which changes how the molecules stick together, which deforms cells, which causes a disease, whose frequency in whole populations has been shaped by another disease over thousands of years. Molecules, cells, organisms, populations and the environment are all part of one connected story. That is biology.

Congratulations on finishing the course.
