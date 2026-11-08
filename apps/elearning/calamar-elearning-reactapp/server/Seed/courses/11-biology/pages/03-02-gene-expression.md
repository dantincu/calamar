# From gene to protein

A gene is a stretch of DNA that is read to make a product, usually a protein. The flow of information, which Francis Crick called the **central dogma**, is:

$$
\text{DNA} \xrightarrow{\text{transcription}} \text{RNA} \xrightarrow{\text{translation}} \text{protein}
$$

## Transcription

**RNA polymerase** opens the DNA at the start of a gene and builds a **messenger RNA** (mRNA) using one strand as a template. The mRNA has the same sequence as the other strand, the **coding strand**, but with uracil (U) in place of thymine (T).

In eukaryotes, the RNA is processed before it leaves the nucleus: a cap and a tail are added, and the **introns** (non-coding interruptions) are cut out, joining the **exons**. Different cuts of the same gene (**alternative splicing**) can give different proteins, one reason why about 20,000 genes can make many more proteins.

## Translation and the genetic code

At a **ribosome**, the mRNA is read three bases at a time. Each triplet, a **codon**, stands for one amino acid. With 4 bases there are $4^3 = 64$ codons for 20 amino acids, so most amino acids have several codons (the code is **degenerate**). One codon, **AUG**, means methionine and also "start"; three (UAA, UAG, UGA) mean "stop".

```bash
node dna.js code
```

```
      second base
       T         C         A         G
T   TTT Phe  TCT Ser  TAT Tyr  TGT Cys
T   TTC Phe  TCC Ser  TAC Tyr  TGC Cys
T   TTA Leu  TCA Ser  TAA Stop TGA Stop
T   TTG Leu  TCG Ser  TAG Stop TGG Trp
...
```

(The table is written with the DNA letter T; in the mRNA it is U.) **Transfer RNAs** (tRNAs) carry the amino acids. Each has an **anticodon** that pairs with a codon, so the ribosome links the right amino acids in the right order, about 5 to 20 per second.

The code is almost **universal**: the same codons mean the same amino acids in bacteria, plants and you. That is why human insulin can be made by bacteria given the human gene.

## A real gene

Here is the start of the coding sequence of human **β-globin** (gene *HBB*), one of the two chains of hemoglobin:

```bash
node dna.js info ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGG
```

```
length       93 bases (31 codons)
GC content   60.2 %
codons       ATG GTG CAC CTG ACT CCT GAG GAG AAG TCT GCC GTT ACT GCC CTG TGG GGC AAG GTG AAC GTG GAT GAA GTT GGT GGT GAG GCC CTG GGC AGG
protein      MVHLTPEEKSAVTALWGKVNVDEVGGEALGR
             Met-Val-His-Leu-Thr-Pro-Glu-Glu-Lys-Ser-Ala-Val-Thr-Ala-Leu-Trp-Gly-Lys-Val-Asn-Val-Asp-Glu-Val-Gly-Gly-Glu-Ala-Leu-Gly-Arg
```

The protein is written with the one-letter codes (M for Met, V for Val…). The full β-globin chain has 147 amino acids; the first methionine is removed after translation, leaving 146.

## Mutations

A **mutation** is a change in the DNA sequence. What a single-base change does depends on where it falls in the codon:

```bash
node dna.js mutate <sequence> 21 A     # GAG -> GAA, codon 7
```

```
protein before  MVHLTPEEKSAVTALWGKVNVDEVGGEALGR
protein after   MVHLTPEEKSAVTALWGKVNVDEVGGEALGR
effect: silent (same protein)
```

GAA also codes for glutamate: a **silent** mutation, thanks to the degenerate code. Change the middle letter instead:

```bash
node dna.js mutate <sequence> 20 T     # GAG -> GTG
```

```
protein after   MVHLTPVEKSAVTALWGKVNVDEVGGEALGR
effect: missense (Glu7Val)
```

A **missense** mutation: glutamate becomes valine. This one is famous: it is the **sickle-cell** mutation, the subject of the final project. (Doctors call it Glu6Val, numbering from after the removed methionine.) Change the first letter:

```bash
node dna.js mutate <sequence> 19 T     # GAG -> TAG
```

```
protein after   MVHLTP*
effect: nonsense (premature stop at codon 7)
```

A **nonsense** mutation: a stop codon cuts the protein short, which usually destroys it. Mutations of this kind in *HBB* cause one form of β-thalassemia. Finally, inserting one extra base shifts the reading frame:

```bash
node dna.js insert <sequence> 10 A
```

```
after   ATG GTG CAC CAT GAC TCC TGA GGA GAA ...
protein after   MVHHDS*
effect: frameshift (every codon after it changes)
```

Every codon after the insertion is read wrong, and a stop codon soon appears by chance. Frameshifts are usually as damaging as nonsense mutations.

## Finding genes

A protein-coding gene begins with ATG and ends at a stop codon in the same frame, with no stop in between: an **open reading frame** (ORF). In random sequence a stop appears about every $64/3 \approx 21$ codons, so a long ORF is a sign of a real gene. `node dna.js orfs <sequence>` searches all six frames (three on each strand). Real gene-finding software also looks at promoters, splicing signals and comparison with other species.

## Check yourself

1. How many of the 64 codons code for an amino acid? Which amino acids have only one codon? (Use `node dna.js code`.)
2. Why are mutations in the third base of a codon more often silent than in the first two?
3. Insert three bases instead of one with `node dna.js insert`. Why is the damage much smaller?
