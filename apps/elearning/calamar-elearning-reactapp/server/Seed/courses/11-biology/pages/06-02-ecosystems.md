# Ecosystems: energy, cycles and biodiversity

An **ecosystem** is a community of living things together with its physical environment: a lake, a forest, a meadow. Two principles organize it: **energy flows** through it once, and **matter cycles**.

## Food chains and trophic levels

- **Producers** (plants, algae, cyanobacteria) capture light energy by photosynthesis.
- **Primary consumers** (herbivores) eat producers.
- **Secondary and tertiary consumers** (carnivores) eat other consumers.
- **Decomposers** (bacteria, fungi) break down dead matter and return its nutrients to the soil.

Real feeding relationships form a **food web**, not a chain: most animals eat several things, and are eaten by several others.

## The 10 % rule

At each step up the chain, most of the energy is lost: used for movement and body heat, or left uneaten or undigested. Typically only 5–20 % passes to the next level, about **10 %** on average:

| Level | Energy available |
|---|---|
| producers | 10,000 kcal |
| herbivores | 1,000 kcal |
| first carnivores | 100 kcal |
| second carnivores | 10 kcal |

This explains why:

- **food chains are short**, rarely more than four or five levels: there is not enough energy left to support a sixth;
- **top predators are rare**: a large hunter like a tiger needs a large territory;
- **eating lower in the chain feeds more people**: crops fed to animals lose most of their energy before they reach us as meat. Per calorie produced, beef needs many times the land of grain or legumes.

## Nutrient cycles

The atoms in your body have been part of other organisms many times.

**Carbon.** Photosynthesis takes CO₂ from the air into living things; respiration, decomposition and fire return it. Over millions of years, buried organisms became coal, oil and gas. Burning them returns that ancient carbon to the air faster than the cycle can absorb it: atmospheric CO₂ rose from about 280 ppm before the industrial era to more than 420 ppm in the 2020s.

**Nitrogen.** Air is 78 % nitrogen, but as N₂, which most organisms can't use. Only certain bacteria can **fix** it into ammonia, some living in nodules on the roots of legumes (peas, beans, clover). That is why farmers rotate legumes with other crops. Since the early 20th century, the **Haber-Bosch** process has fixed nitrogen industrially for fertilizer; it now feeds roughly half the world's population.

## Measuring biodiversity

Biodiversity has two parts: how many species (**richness**) and how evenly the individuals are spread among them (**evenness**). Two communities with four species each:

```bash
node population.js shannon 40 30 20 10
```

```
4 species, 100 individuals
Shannon index      H = -sum p ln p = 1.280  (maximum ln S = 1.386)
evenness           H / ln S = 0.923
Gini-Simpson index 1 - sum p^2 = 0.700 (chance two random individuals are different species)
```

```bash
node population.js shannon 91 3 3 3
```

```
4 species, 100 individuals
Shannon index      H = -sum p ln p = 0.401  (maximum ln S = 1.386)
evenness           H / ln S = 0.290
Gini-Simpson index 1 - sum p^2 = 0.169 (chance two random individuals are different species)
```

The **Shannon index** comes from information theory:

$$
H = -\sum_{i=1}^{S} p_i \ln p_i
$$

where $p_i$ is the proportion of species $i$. It is largest, $\ln S$, when all $S$ species are equally common. The **Gini-Simpson index**, $1 - \sum p_i^2$, is the chance that two individuals picked at random belong to different species. Both say the same thing: the second community, dominated by one species, is far less diverse, even though it has as many species.

## Why biodiversity matters

- **Stability**: diverse ecosystems tend to resist and recover from disturbances better, because different species respond differently.
- **Services**: pollination, clean water, fertile soil, flood control, fisheries, medicines (aspirin's ancestor came from willow bark).
- **Keystone species** have effects far larger than their numbers. When wolves were reintroduced to Yellowstone in 1995, they changed the behavior and numbers of elk, with effects on the vegetation along rivers that ecologists are still studying and debating.

The main threats are habitat loss, overexploitation, invasive species, pollution and climate change. Rates of extinction today are estimated at tens to hundreds of times the background rate seen in the fossil record.

## Check yourself

1. A field produces 20,000 kcal of plants. Roughly how much energy reaches the hawks that eat the snakes that eat the mice that eat the seeds?
2. Why do legumes improve soil for the next crop?
3. A forest has 10 tree species, all equally common. What is its Shannon index? Its Gini-Simpson index?
