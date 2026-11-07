# Planning and costing a week

You need four files from this page, in one folder: `recipe-cost.js`, `recipes.json`, `pantry-bucharest.json` and `week-menu.json`.

## 1. The sample week

`week-menu.json` plans one adult's week. Each meal lists recipe portions (by their id in `recipes.json`) and extra foods in grams:

```json
"Monday": {
  "breakfast": { "recipes": { "terci-de-ovaz": 1 } },
  "lunch":     { "recipes": { "ciorba-de-fasole": 1, "salata-de-varza": 1 }, "foods": { "wholemeal bread": 80 } },
  "snack":     { "foods": { "apple": 150, "walnuts": 20 } },
  "dinner":    { "recipes": { "omleta-cu-spanac": 1 }, "foods": { "wholemeal bread": 60 } }
}
```

The week follows the batch-cooking plan from chapter 3: the soup, the braised cabbage and the cabbage salad are cooked on Sunday; the lentils, the *ghiveci* and the beetroot salad on Wednesday; the omelette, the mămăligă, the mackerel, the *fasole bătută* and the *tocăniță* are cooked on the day. Porridge for breakfast most days, and yogurt or fruit as snacks.

## 2. What it costs, and what it gives

```bash
node recipe-cost.js --week week-menu.json
```

```
Day          cost       energy   protein  fiber   salt   fruit+veg
Monday      13.94 lei    1786 kcal    80 g    43 g   4.8 g     740 g
Tuesday     14.86 lei    1889 kcal    91 g    41 g   4.5 g     683 g
Wednesday   13.95 lei    1975 kcal    91 g    47 g   5.0 g     894 g
Thursday    15.51 lei    1894 kcal    87 g    43 g   4.5 g     808 g
Friday      14.90 lei    1959 kcal    87 g    43 g   3.8 g     583 g
Saturday    11.23 lei    1749 kcal    69 g    40 g   4.9 g     708 g
Sunday      14.23 lei    1902 kcal    80 g    41 g   4.3 g     672 g

Week: 98.62 lei (14.09 lei a day, about 428 lei a month)
Daily average: 1879 kcal, 84 g protein, 42 g fiber, 4.5 g salt, 727 g fruit and vegetables, saturated fat 8.3 % of energy
Cost of 1000 kcal: 7.50 lei
```

Check it against the targets from *Nutrition Fundamentals*:

| Target | The week | |
|---|---|---|
| protein ≥ 0.83 g/kg (54 g at 65 kg) | 84 g | ✓ |
| fiber ≥ 25 g | 42 g | ✓ |
| fruit and vegetables ≥ 400 g | 727 g | ✓ |
| salt < 5 g | 4.5 g on average | ✓, but Wednesday is right at the limit |
| saturated fat < 10 % of energy | 8.3 % | ✓ |
| energy | 1879 kcal | right for a smaller or less active adult; see below |

## 3. The shopping list

The week's cost counts only the portions eaten. The shopping list counts what you actually buy: whole or half pots, so some portions are left over for the freezer or the next week.

```bash
node recipe-cost.js --shopping week-menu.json
```

```
Cook:
  6 x Terci de ovăz (oat porridge with apple and walnuts) (6 portions, 6 eaten)
  half a pot of Ciorbă de fasole (bean soup) (3 portions, 2 eaten, 1 left over)
  1 x Salată de varză (cabbage and carrot salad) (4 portions, 3 eaten, 1 left over)
  ...
Buy:
  milk                       1.50 kg   10.50 lei
  apple                      1.35 kg    6.08 lei
  potato                     1.30 kg    3.90 lei
  cabbage                    1.20 kg    3.00 lei
  canned tomatoes              800 g    8.00 lei
  ...
Shopping: 114.26 lei, of which about 15.63 lei is left-over portions.
```

Split the list by shop: produce, eggs and cheese at the market; the rest at the discounter.

## 4. Adjusting the week

**More energy.** An active adult may need 2300–2800 kcal. Adding energy cheaply and healthily:

| Addition | Extra energy | Extra cost |
|---|---|---|
| 60 g more wholemeal bread | ≈ 150 kcal | ≈ 0.72 lei |
| 30 g more oats in the porridge | ≈ 115 kcal | ≈ 0.24 lei |
| a second portion of *fasole bătută* | ≈ 315 kcal | ≈ 0.94 lei |
| 20 g of sunflower seeds | ≈ 115 kcal | ≈ 0.28 lei |
| 1 tablespoon (10 g) more oil in cooking | ≈ 90 kcal | ≈ 0.09 lei |

So 500 kcal more costs about 1.5–2 lei a day, not 25 %.

**For a family.** Multiply the portions. Costs per person fall a little, because whole pots leave nothing over, and big packages are cheaper per kilogram. Children need less energy but similar nutrient density: smaller portions of the same food, plus milk or yogurt.

**Out of season.** In February, replace the *ghiveci* with a sauerkraut or cabbage dish, the plums with apples, and fresh tomatoes with canned. Use frozen vegetables freely.

## 5. Your turn

**Exercise 1.** Wednesday is right at the 5 g salt limit. Find its main sources of salt: run `node recipe-cost.js` for each of its recipes, and remember that 100 g of bread has about 1.1 g. Then change one thing to bring the day well below the limit, without losing more than 5 g of protein. *Hint*: the 140 g of bread is the largest single source. Halving the salt added to the lentil stew and the beetroot salad also helps, and nobody will taste the difference with a squeeze of lemon.

**Exercise 2.** Update `pantry-bucharest.json` with the prices from your last receipts, and run the week again. How much has it changed?

**Exercise 3.** Add a recipe of your own to `recipes.json`, for example *sarmale de post*, *ardei umpluți* or *pilaf cu ciuperci*, and put it in the week. Is it cheaper or more expensive per portion than the recipes it replaced? Does it change the targets?

**Exercise 4.** Plan a fasting week (*săptămână de post*): no meat, eggs or dairy. Replace the porridge's milk with water and add more walnuts; replace the omelette, the mămăligă and the yogurt with legume dishes and fruit. Check that protein stays above 54 g a day.

## What this shows

Healthy food in Bucharest costs about **14 lei a day** for one adult at these prices: about 430 lei a month, less with loyalty-app discounts, more with meat every day. The expensive diets are the ones built on ready meals, cured meats, sweets, soft drinks and eating out, which are also the less healthy ones.

The prices will change. The method won't: **plan around seasonal produce and legumes, compare unit prices, cook in batches, waste nothing, and check the numbers.**

Congratulations on finishing the course. Poftă bună!
