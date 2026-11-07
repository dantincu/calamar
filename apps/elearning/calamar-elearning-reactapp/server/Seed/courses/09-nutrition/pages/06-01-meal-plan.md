# Checking a day of meals

You need three files from this page, in one folder: `foods.json` (nutrients per 100 g of 38 common foods), `day-plan.json` (two example days) and `meal-plan.js`. The calculator from the first chapter, `nutrition-calc.js`, gives your personal targets.

## 1. Your targets

```bash
node nutrition-calc.js --sex f --age 30 --weight 65 --height 168 --activity moderate
```

Note the energy target and your weight; `meal-plan.js` takes them as `--kcal` and `--weight` (by default 2000 kcal and 65 kg).

## 2. A typical day

`day-plan.json` describes days as meals, and each meal as foods with their weight in grams **as bought**: dry oats, rice and legumes; raw meat and vegetables. The first example is a common pattern: bread with telemea and sweet tea in the morning, fried chicken legs and potatoes at lunch, a pastry, and pasta with cheese in the evening.

```json
"typical": {
  "breakfast": { "white bread": 100, "telemea": 60, "sugar": 10 },
  "lunch":     { "chicken legs": 250, "potato": 300, "sunflower oil": 25, "white bread": 50, "salt": 2 },
  "snack":     { "white bread": 60, "sugar": 25, "sunflower oil": 15 },
  "dinner":    { "pasta": 120, "telemea": 50, "sunflower oil": 10, "salt": 1 }
}
```

```bash
node meal-plan.js day-plan.json typical
```

```
== typical ==
  MISS  Energy         2636 kcal          target 2000 kcal +-10 %
  ok    Protein        99 g               target >= 54 g
  MISS  Fat            41 % of energy     target 20-35 %
  MISS  Saturated fat  11.6 % of energy   target < 10 %
  MISS  Carbohydrate   41 % of energy     target 45-60 %
  ok    Free sugars    5 % of energy      target < 10 % (ideally < 5 %)
  MISS  Fiber          16 g               target >= 25 g
  MISS  Salt           9.1 g              target < 5 g
  MISS  Fruit and veg  0 g                target >= 400 g
  2/9 targets met
```

Nothing on the menu is "junk food", yet it misses seven of nine targets. Notice what it gets **right**: protein is plentiful, as in most European diets. The problems are what's missing (vegetables, fruit, fiber) and what's hidden (salt in bread and cheese, oil for frying).

## 3. An improved day

The second example keeps familiar foods but changes their proportions:

```json
"improved": {
  "breakfast": { "oats": 60, "milk": 250, "apple": 150, "walnuts": 15 },
  "lunch":     { "lentils": 70, "carrot": 80, "onion": 60, "canned tomatoes": 150, "sunflower oil": 10, "wholemeal bread": 90, "salt": 1 },
  "snack":     { "yogurt": 150, "plums": 150 },
  "dinner":    { "egg": 110, "spinach": 150, "potato": 200, "cabbage": 150, "sunflower oil": 10, "telemea": 30 }
}
```

```
== improved ==
  ok    Energy         1925 kcal          target 2000 kcal +-10 %
  ok    Protein        86 g               target >= 54 g
  ok    Fat            33 % of energy     target 20-35 %
  ok    Saturated fat  9.8 % of energy    target < 10 %
  MISS  Carbohydrate   44 % of energy     target 45-60 %
  ok    Free sugars    0 % of energy      target < 10 % (ideally < 5 %)
  ok    Fiber          44 g               target >= 25 g
  ok    Salt           4.6 g              target < 5 g
  ok    Fruit and veg  890 g              target >= 400 g
  8/9 targets met
```

Oats replace white bread, lentils replace fried chicken, vegetables fill half of every plate, and fruit with yogurt replaces the pastry. Fiber nearly triples, salt halves, and fruit and vegetables go from 0 to 890 g.

## 4. Your turn

**Exercise 1.** The improved day still misses one target. Find a change that fixes it without breaking another.

*One solution:* swap the 30 g of telemea at dinner for 60 g of cottage cheese (*brânză de vaci*). Twice the portion still has less than half the fat (2.6 g instead of 6.4 g), so the *share* of energy from carbohydrate rises to 45 %, and all nine targets are met (fat 31 %, saturated fat 8.3 %, salt 4.3 g).

The obvious fix, 50 g more wholemeal bread, raises carbohydrate to 46 %, but pushes salt to 5.2 g, over the limit. Fixing one number often moves another, which is why it helps to check them all at once.

**Exercise 2.** Write your own day. Add a day to `day-plan.json`, with what you actually ate yesterday, and run it with your targets:

```bash
node meal-plan.js day-plan.json yesterday --kcal 2150 --weight 65
```

If a food is missing, add it to `foods.json` from the label of the product (per 100 g), or from a food composition table. Only the field names must match.

**Exercise 3.** Design a fasting day (*zi de post*), with no meat, eggs or dairy, that meets all nine targets. Hint: start from the plant-based day in *Plant-based eating and fasting periods*.

## What the numbers can't tell you

The script checks nine targets, not a whole diet. It doesn't check vitamins, the variety of foods across a week, or how food tastes and how much it costs. Use it to find **patterns**, and change one habit at a time.

For the cost side, continue with the companion course, *Healthy Cooking on a Budget in Bucharest*.

Congratulations on finishing the course.
