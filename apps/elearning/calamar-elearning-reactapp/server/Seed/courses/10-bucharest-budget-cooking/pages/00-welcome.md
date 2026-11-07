# Welcome to the course

Eating healthily in Bucharest doesn't have to be expensive. The city has some of the best markets in Europe for seasonal produce, discount supermarkets on every other corner, and a traditional cuisine built on beans, lentils, cabbage, potatoes, cornmeal and vegetables: cheap, filling and good for you.

This course shows how to put that together. At autumn 2026 prices, the sample week in the final chapter feeds one adult for **about 100 lei a week**, about 14 lei a day. It meets the main nutrition targets: 84 g of protein, 42 g of fiber and about 730 g of fruit and vegetables a day, with salt and saturated fat within the limits.

## What you will learn

1. **Shopping in Bucharest**: markets vs supermarkets, when and where produce is cheapest, the seasonal calendar, and the arithmetic of unit prices.
2. **The budget pantry**: the staples that give the most nutrition per leu, and how to store food without waste.
3. **Techniques**: batch cooking for the week, and cooking dry legumes, the cheapest protein there is.
4. **Recipes**: Romanian classics in healthy, budget versions (*ciorbă de fasole*, *mâncare de linte*, *tocăniță*, *ghiveci*, *varză călită*, mackerel with potatoes, *mămăligă* with cheese and eggs, salads and *fasole bătută*), each with its cost and nutrients per portion.
5. **Project**: plan, cost and check a week of meals.

## About the prices

Prices are in **lei**, for Bucharest in **autumn 2026**, without special offers: discount supermarkets (Lidl, Kaufland, Penny, Profi) for packaged foods, and markets such as Obor for seasonal produce. They are estimates from published prices and shelf checks, and they change every week, so:

- every price lives in one file, `pantry-bucharest.json`, that you can update from your own receipts;
- the calculations, not the prices, are the lesson. With your prices, the scripts give your costs.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages). Download the files of a page into one folder:

```bash
node recipe-cost.js                       # every recipe: cost and nutrients per portion
node recipe-cost.js ciorba-de-fasole      # one recipe, ingredient by ingredient
node recipe-cost.js --week week-menu.json # a week of meals
node unit-price.js --rank                 # the cheapest protein, energy and fiber
```

The nutrition targets used here are explained in the companion course, *Nutrition Fundamentals: Eating Well, Backed by Evidence*. You don't need to take it first, but it explains the *why*.

A note on safety: if you have a medical condition, allergies or special dietary needs, adapt the recipes with a doctor or dietitian.
