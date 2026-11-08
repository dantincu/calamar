# Populations: growth, limits and cycles

A **population** is a group of individuals of one species living in the same area. How fast does it grow, and what stops it?

## Exponential growth

If each individual has, on average, the same chance of reproducing and dying, the growth rate is proportional to the population size $N$:

$$
\frac{dN}{dt} = rN \quad \Longrightarrow \quad N(t) = N_0\, e^{rt}
$$

where $r$ is the per-capita growth rate (births minus deaths). The population doubles every $\ln 2 / r$:

```bash
node population.js exp 100 0.3 20
```

```
year  population  (N = N0 e^(rt))
   0         100
   4         332
   8        1102
  12        3660
  16       12151
  20       40343

doubling time = ln 2 / r = 2.31 years
```

Exponential growth always ends: no environment can support a population that doubles forever. It happens for a while when a species arrives somewhere with no competitors or predators: rabbits in Australia after 1859, or bacteria in fresh broth.

## Logistic growth

As the population grows, resources run short, and growth slows. The simplest model, the **logistic equation** (Pierre-François Verhulst, 1838), adds a **carrying capacity** $K$, the largest population the environment can support:

$$
\frac{dN}{dt} = rN\left(1 - \frac{N}{K}\right) \quad \Longrightarrow \quad N(t) = \frac{K}{1 + \frac{K - N_0}{N_0}\, e^{-rt}}
$$

When $N$ is small, the bracket is close to 1 and growth is exponential; as $N$ approaches $K$, growth stops.

```bash
node population.js logistic 100 0.3 1000 40
```

```
year  population  growth/yr
   0       100        27.0
   4       269        59.1
   8       551        74.2
  12       803        47.5
  16       931        19.3
  20       978         6.4
  28       998         0.6
  40      1000         0.0

fastest growth at N = K/2 = 500: r K / 4 = 75.0 per year (the "maximum sustainable yield")
```

The S-shaped curve has its steepest point at $N = K/2$. Fisheries managers have used this to set catches: harvesting the yearly growth $rK/4$ of a population kept at half its carrying capacity is, in theory, sustainable. In practice, uncertain estimates of $r$ and $K$ have led to the collapse of fisheries such as the Newfoundland cod in 1992.

## Predators and prey

In the 1920s, Alfred Lotka and Vito Volterra independently modeled a prey population $x$ and its predator $y$:

$$
\frac{dx}{dt} = a x - b x y, \qquad \frac{dy}{dt} = d\,b\,x y - c y
$$

- prey reproduce at rate $a$, and are eaten at a rate proportional to encounters, $bxy$;
- predators convert a fraction $d$ of the prey they eat into new predators, and die at rate $c$.

There is no formula for the solution, so the script solves the equations numerically, with the **Runge-Kutta** method (RK4) and a small time step:

```bash
node population.js lv 60 5 12
```

```
a=1 (prey births), b=0.1 (predation), c=1.5 (predator deaths), d=0.375 (conversion)
equilibrium: prey c/(d b) = 40.0, predators a/b = 10.0

  time    prey  predators
   0.0    60.0        5.0
   1.0    67.3       14.9
   2.0    27.2       18.5
   3.0    19.0        9.1
   4.0    27.0        4.6
   5.0    48.9        4.1
   6.0    73.0        9.6
   7.0    39.2       20.5
   8.0    19.4       12.2
   9.0    22.5        5.7
  10.0    39.0        3.9
  11.0    67.2        6.3
  12.0    56.6       18.5
```

The populations **cycle**, with the predator peaks lagging behind the prey peaks: many prey feed many predators, which eat the prey down, then starve, which lets the prey recover. Setting both derivatives to zero gives the equilibrium, $x^* = c/(db)$ and $y^* = a/b$. Start exactly there (`node population.js lv 40 10 12`) and nothing changes; start near it and the cycles are small.

The best-known real example is the Canada lynx and the snowshoe hare, whose numbers in the Hudson's Bay Company fur records rise and fall with a period of about 10 years. Real cycles involve more factors (the hares' food plants, for one), but the model captures the essential lag.

## Human population

The world population passed 8 billion in 2022. It grew fastest, about 2 % a year, in the 1960s, and its growth rate has since roughly halved as birth rates fell. UN projections show it peaking in the 2080s at around 10.3 billion. Human population growth is a story of a carrying capacity that technology keeps raising, and of birth rates that fall as countries grow richer.

## Check yourself

1. A population grows at $r = 0.07$ per year. What is its doubling time? (This gives the "rule of 70": doubling time ≈ 70 / growth rate in percent.)
2. In the logistic model with $K = 1000$, why is the growth rate the same at $N = 200$ and $N = 800$?
3. In the Lotka-Volterra model, what happens to the prey's equilibrium if predators die faster (larger $c$)? Is that intuitive?
