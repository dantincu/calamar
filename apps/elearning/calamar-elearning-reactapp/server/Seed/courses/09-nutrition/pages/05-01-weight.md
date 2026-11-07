# Weight change in practice

## The 7700 kcal rule

A kilogram of body fat stores about 7700 kcal (3500 kcal per pound). From that comes a popular rule: eat 500 kcal a day less, and you lose

$$
\frac{500 \times 7}{7700} \approx 0.45\ \text{kg per week}, \quad \text{forever}
$$

In the short term it isn't too far off. In the long term it is badly wrong: it predicts that a 500 kcal/day deficit kept for three years removes 71 kg, more than many people weigh.

## Why weight levels off

As you lose weight, you burn less: a smaller body needs less energy to maintain and to move, and the body also adapts somewhat. The deficit shrinks, until intake and expenditure match again at a new, lower weight.

Kevin Hall's group at the US National Institutes of Health built a model from metabolic studies, and summarized it as a rule of thumb (*Lancet*, 2011): for an average adult,

> every **10 kcal/day** of sustained change in intake changes body weight by about **0.45 kg in the end**, with half of the change after about a year and 95 % after about three years.

So the eventual change is

$$
\Delta W_\infty \approx \frac{\Delta E}{22}\ \text{kg} \quad (\Delta E \text{ in kcal/day})
$$

and a simple curve with that half-life is

$$
\Delta W(t) \approx \Delta W_\infty \left(1 - e^{-t/\tau}\right), \qquad \tau = \frac{365\ \text{days}}{\ln 2} \approx 527\ \text{days}
$$

## Comparing the two

The attached `weight-change.js` computes both:

```bash
node weight-change.js --deficit 500
```

```
Sustained deficit: 500 kcal/day
Eventual change (dynamic): 22.5 kg

After       7700-kcal rule   dynamic rule
1 months         1.9 kg          1.2 kg
3 months         5.9 kg          3.6 kg
6 months        11.8 kg          6.6 kg
1 year          23.7 kg         11.3 kg
2 years         47.4 kg         16.9 kg
3 years         71.1 kg         19.7 kg
```

The simple curve underestimates the first weeks: early on, people also lose water and the glycogen stored in muscles and the liver, often 1–2 kg in the first week or two. That is why the scale drops fast at first and then slows, and why people think a diet "stopped working". The real model is more complex; this curve only shows the shape.

## What this means in practice

- **Plateaus are expected.** To keep losing, the deficit has to grow (eat a bit less, or move more), or you accept the new weight.
- **Small, permanent changes add up.** Leaving out a 250 kcal pastry every day leads to about 11 kg less in the end, but over years, not weeks.
- **Maintenance is the real goal.** Most people regain weight after a diet because they go back to how they ate before, at a body that now needs *less*. The habits must last.
- **What helps keep weight off**, according to studies of people who did: regular physical activity, regular meals and breakfast, high-fiber and high-protein foods, weighing yourself regularly, and sleeping enough.
- **The type of diet matters less than sticking to it.** In trials, low-fat and low-carbohydrate diets give similar weight loss after a year (DIETFITS, 2018). Choose the pattern you can keep.

Medication (such as GLP-1 receptor agonists) and bariatric surgery work for many people with obesity, and are decisions for a doctor.
