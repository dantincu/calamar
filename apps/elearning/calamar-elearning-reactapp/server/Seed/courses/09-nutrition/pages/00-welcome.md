# Welcome to the course

Few subjects have as much confident advice and as little agreement as nutrition. The basics are actually well established, and they fit on one page. This course teaches those basics, the numbers behind them, and how to tell the evidence from the noise.

## What you will learn

1. **Energy**: what a calorie is, where it comes from, and how to estimate how much energy *you* need.
2. **Macronutrients**: protein, carbohydrates and fiber, and fats. How much of each, and which kinds.
3. **Micronutrients and water**: the vitamins and minerals people actually run short of, and salt, water and alcohol.
4. **Building a healthy diet**: the healthy plate, reading an EU food label, and plant-based eating, including the Orthodox fasting periods (*post*) common in Romania.
5. **Evidence**: what really happens when you eat less, and how to judge a nutrition headline.
6. **Project**: check a real day of meals against the targets, and fix it.

The companion course, *Healthy Cooking on a Budget in Bucharest*, turns these ideas into shopping lists and recipes.

## About the numbers

Nutrition is mostly arithmetic. For example, a food's energy is the sum of its nutrients weighted by their energy per gram:

$$
E = 4\,P + 4\,C + 9\,F + 2\,\text{Fib} \quad [\text{kcal, with grams}]
$$

The formulas in this course need nothing beyond school algebra. They are also implemented in the sample files, which run with Node.js 18 or later and need no packages:

```bash
node nutrition-calc.js --sex f --age 30 --weight 65 --height 168 --activity moderate
node label-check.js --kcal 452 --fat 22 --sat 9.5 --carbs 57 --sugars 31 --protein 5.8 --salt 0.6 --portion 40
node meal-plan.js
```

## Where the numbers come from

The targets follow the **European Food Safety Authority (EFSA)** dietary reference values and the **World Health Organization (WHO)** guidelines. Romania's own recommendations are based on them too. Food composition values come from standard tables, rounded; the label on the food you buy is always more accurate for that food.

## A word of caution

This course is general education for healthy adults. It is **not medical advice**. Pregnancy, breastfeeding, children and teenagers, older adults with frailty, eating disorders, diabetes, kidney disease and other conditions all change the rules, so in those cases talk to a doctor or a registered dietitian (*dietetician autorizat*).
