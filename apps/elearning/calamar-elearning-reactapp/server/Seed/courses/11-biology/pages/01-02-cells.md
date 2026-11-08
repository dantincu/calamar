# Cells, and why they are small

## The cell theory

Formulated in the 19th century (Schleiden, Schwann, Virchow), the **cell theory** says that:

1. all living things are made of cells;
2. the cell is the basic unit of structure and function;
3. all cells come from pre-existing cells (*omnis cellula e cellula*).

## Two kinds of cells

| | Prokaryotic (bacteria, archaea) | Eukaryotic (protists, fungi, plants, animals) |
|---|---|---|
| Nucleus | no: the DNA lies in the cytoplasm | yes, enclosed by a double membrane |
| Size | usually 1–5 µm | usually 10–100 µm |
| Organelles | none bounded by membranes | mitochondria, endoplasmic reticulum, Golgi, lysosomes… |
| DNA | one circular chromosome, plus plasmids | several linear chromosomes |
| Ribosomes | yes (smaller, 70S) | yes (larger, 80S) |

Both have a **plasma membrane** (a lipid bilayer that controls what goes in and out), **cytoplasm** and **ribosomes**, where proteins are made.

### The main eukaryotic organelles

- **Nucleus**: holds the DNA; where genes are copied into RNA.
- **Mitochondria**: produce most of the cell's ATP by respiration.
- **Endoplasmic reticulum** (rough, with ribosomes; smooth, for lipids) and **Golgi apparatus**: make, fold, label and ship proteins.
- **Lysosomes**: digest worn-out parts and food.
- **Cytoskeleton**: protein filaments that give shape and move things around.
- In plants: a **cell wall** of cellulose, **chloroplasts** for photosynthesis, and a large **vacuole**.

Mitochondria and chloroplasts have their own small circular DNA and divide on their own, like bacteria. According to the **endosymbiotic theory**, they descend from bacteria that were engulfed by an ancestral cell more than 1.5 billion years ago and stayed.

## Why cells are small: surface and volume

A cell exchanges everything (food, oxygen, waste, heat) through its surface, but it needs those exchanges in proportion to its volume. For a sphere of radius $r$:

$$
A = 4\pi r^2, \qquad V = \tfrac{4}{3}\pi r^3, \qquad \frac{A}{V} = \frac{3}{r}
$$

The ratio falls as the cell grows. Doubling the radius gives 4 times the surface but 8 times the volume to supply:

| Diameter | $A/V$ |
|---|---|
| 2 µm (a bacterium) | 3.0 µm⁻¹ |
| 10 µm (a small animal cell) | 0.6 µm⁻¹ |
| 100 µm | 0.06 µm⁻¹ |

That is why large cells are flattened (red blood cells), long and thin (neurons), or folded (intestinal cells with microvilli): all ways of increasing surface for the same volume.

## Why cells are small: diffusion

Inside the cell, molecules move mainly by **diffusion**, the random motion that spreads them from high to low concentration. The typical time to diffuse a distance $x$ grows with its *square*:

$$
t \approx \frac{x^2}{2D}
$$

where $D$ is the diffusion coefficient. For a small molecule like oxygen in water, $D \approx 2 \times 10^{-9}\ \text{m}^2/\text{s}$:

| Distance | Time |
|---|---|
| 10 µm (across a cell) | $\frac{(10^{-5})^2}{4 \times 10^{-9}} = 0.025$ s |
| 1 mm | $\frac{(10^{-3})^2}{4 \times 10^{-9}} = 250$ s, about 4 minutes |
| 1 cm | about 7 hours |

Diffusion is fast over a cell and hopelessly slow over a body. So large organisms need **transport systems** (blood vessels, lungs, the xylem and phloem of plants) that bring every cell within a few tens of micrometers of a supply. In your body, almost no cell is more than about 0.1 mm from a capillary.

## How cells divide

Cells reproduce by division:

- **Binary fission** in bacteria: copy the chromosome, grow, split in two. In ideal conditions, *E. coli* divides every 20 minutes.
- **Mitosis** in eukaryotes: the duplicated chromosomes are separated into two identical daughter nuclei. It is how you grow and heal.
- **Meiosis**: two divisions that halve the chromosome number to make eggs and sperm, and shuffle the parents' genes (see the genetics chapter).

How fast could bacteria multiply? With a doubling every 20 minutes, one cell gives $2^{72}$ cells in 24 hours, about $4.7 \times 10^{21}$. At about $10^{-12}$ g per cell, that is roughly 5,000 tonnes of bacteria. In reality food runs out within hours: a first look at the population limits of the ecology chapter.

## Check yourself

1. A cell's radius triples. By what factor do its surface, its volume and its $A/V$ ratio change?
2. How long would oxygen take to diffuse 0.1 mm? What does that suggest about the thickness of tissue without blood vessels?
3. Why can't a prokaryote simply grow to the size of an amoeba (about 0.5 mm)?
