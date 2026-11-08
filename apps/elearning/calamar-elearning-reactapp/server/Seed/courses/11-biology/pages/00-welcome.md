# Welcome to the course

Biology is the science of living things, from the molecules inside a bacterium to the forests that cover continents. It can look like a long list of names to memorize. This course takes another route: it explains the **mechanisms**, and puts **numbers** on them wherever a few lines of arithmetic make an idea click.

## What you will learn

1. **Life and cells**: what all living things have in common, and why cells are small (a question of surface, volume and diffusion).
2. **The molecules of life**: water, carbohydrates, lipids, proteins and nucleic acids; enzymes and their kinetics; respiration and photosynthesis.
3. **Genetics**: DNA and its replication, how a gene is read into a protein, mutations, and Mendel's laws.
4. **Evolution**: natural selection and its evidence, and population genetics: Hardy-Weinberg, selection and genetic drift.
5. **The human body**: the organ systems, with the Nernst equation for nerve cells and the herd immunity threshold.
6. **Ecology**: population growth, predator-prey cycles, energy flow and biodiversity indices.
7. **Project**: the sickle-cell mutation, from one letter of DNA to the population.

## The sample files

Each tool is a small Node.js script (Node 18 or later, no packages). Download a page's files and run them:

```bash
node dna.js info ATGGTGCACCTGACTCCTGAGGAG     # DNA -> mRNA -> protein
node genetics.js cross AaBb AaBb               # Mendel's 9:3:3:1
node genetics.js drift 0.5 20 100 8            # genetic drift in a small population
node population.js lv 60 5 12                  # predator-prey cycles
node enzymes.js curve 10 2                     # Michaelis-Menten kinetics
```

Every output shown in the pages comes from running these scripts. Change the numbers and see what happens: that is the point of them.

## What you need

No previous biology. The math is high-school level: fractions, powers, logarithms and an occasional equation. Where a formula appears, the text explains each symbol, and a script computes it for you.
