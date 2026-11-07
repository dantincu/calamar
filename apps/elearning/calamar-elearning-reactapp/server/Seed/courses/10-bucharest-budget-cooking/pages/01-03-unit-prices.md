# Unit prices and the cost of nutrients

## Price per kilogram

The price on a package means little on its own. What matters is the **unit price**:

$$
p_{\text{kg}} = \frac{\text{price}}{\text{net weight (g)}} \times 1000
$$

By law, Romanian shops must show it on the shelf label, as *preț pe kg* or *preț pe litru*, but often in small print. Bigger packages aren't always cheaper per kilogram, and offers on small packages can beat large ones.

```bash
node unit-price.js "Linte 500 g" 5.49 500 "Linte 1 kg" 9.99 1000 "Linte 400 g, oferta" 3.99 400
```

```
Linte 400 g, oferta             3.99 lei /   400 g =    9.97 lei/kg  cheapest
Linte 1 kg                      9.99 lei /  1000 g =    9.99 lei/kg  +0 %
Linte 500 g                     5.49 lei /   500 g =   10.98 lei/kg  +10 %
```

### Watch the net weight

- **Canned food**: compare the drained weight (*masa netă după scurgere*), not the total. A 400 g can of beans contains about 240 g of beans.
- **Frozen fish and seafood**: the glaze of ice can be 10–20 % of the weight; the label must show the net weight without it.
- **Shrinkflation**: packages get smaller at the same price. The unit price exposes it.

## The edible part

Peel, bones and shells are paid for but not eaten. With an edible fraction $y$:

$$
p_{\text{edible}} = \frac{p_{\text{kg}}}{y}
$$

| Food | Price per kg (lei) | Edible fraction | Price per edible kg |
|---|---|---|---|
| chicken legs | 15 | 0.75 | 20 |
| whole mackerel | 20 | 0.60 | 33 |
| eggs (in the shell) | 14 | 0.88 | 16 |
| bananas | 7 | 0.65 | 11 |
| potatoes | 3 | 0.85 | 3.5 |

## The cost of a nutrient

To compare foods, ask what a **portion of a nutrient** costs. For protein, with $P$ grams of protein per 100 g of edible food:

$$
\text{lei per 20 g of protein} = \frac{20 \times p_{\text{kg}}}{10 \times P \times y}
$$

The $10P$ is the protein in one kilogram. For dry white beans at 9 lei/kg with 23.4 g of protein per 100 g:

$$
\frac{20 \times 9}{10 \times 23.4 \times 1} = \frac{180}{234} \approx 0.77\ \text{lei}
$$

For chicken legs at 15 lei/kg, 17 g of protein per 100 g, and 75 % edible:

$$
\frac{20 \times 15}{10 \times 17 \times 0.75} = \frac{300}{127.5} \approx 2.35\ \text{lei}
$$

Beans give the same protein for a third of the price, and with 15 g of fiber per 100 g that chicken doesn't have.

`unit-price.js --rank` does this for every food in `pantry-bucharest.json`:

```
Cheapest protein: lei for 20 g of protein (a portion's worth)
    0.68 lei  flour
    0.77 lei  white beans
    0.85 lei  lentils
    1.17 lei  chickpeas
    1.21 lei  oats
    ...
    2.35 lei  chicken legs
    2.53 lei  egg
    2.67 lei  chicken breast
```

Flour comes first, but grain protein is low in the amino acid lysine, and you would need about 200 g of flour (700 kcal) for 20 g of protein. Price is one criterion; nutrition is another. The best buys are high on both: **legumes, oats, eggs, chicken legs, canned fish, cabbage and carrots**.

## The budget formula

A healthy diet costs

$$
\text{daily cost} = \sum_i m_i \, \frac{p_i}{1000}
$$

where $m_i$ is the grams of food $i$ eaten per day and $p_i$ its price per kg. To lower it, you can lower the price per kg (where and when you buy) or shift weight toward cheaper foods. The best savings do both while *improving* nutrition: replacing some meat with legumes, and expensive out-of-season vegetables with seasonal, frozen or pickled ones.
