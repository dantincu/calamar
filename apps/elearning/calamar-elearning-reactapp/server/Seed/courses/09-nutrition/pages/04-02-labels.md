# Reading food labels

Every packaged food sold in the EU must carry a **nutrition declaration** (Regulation 1169/2011). In Romanian it is the *declarație nutrițională*, and it always lists the same seven values, per 100 g or 100 ml:

| English | Romanian | |
|---|---|---|
| Energy | Valoare energetică | in kJ and kcal |
| Fat | Grăsimi | |
| of which saturates | din care acizi grași saturați | |
| Carbohydrate | Glucide | available carbohydrate, without fiber |
| of which sugars | din care zaharuri | **all** sugars, added or natural |
| Protein | Proteine | |
| Salt | Sare | sodium × 2.5 |

Fiber (*fibre*) is optional, but most manufacturers show it.

## Four habits

**1. Compare per 100 g, not per portion.** Portions are chosen by the manufacturer, and a "portion" of biscuits may be two biscuits. Per 100 g lets you compare two products directly.

**2. Read the ingredient list too.** Ingredients are listed in **descending order of weight**. If sugar (*zahăr*), glucose syrup (*sirop de glucoză*) or several sugars appear among the first ingredients, the product is mostly sugar. Allergens are printed in bold.

**3. Use the reference intakes.** Labels may show a portion as a percentage of the **reference intake** (RI) of an average adult:

| Energy | Fat | Saturates | Carbohydrate | Sugars | Protein | Salt |
|---|---|---|---|---|---|---|
| 8400 kJ / 2000 kcal | 70 g | 20 g | 260 g | 90 g | 50 g | 6 g |

The RI for sugars (90 g) counts **all** sugars, and is not a recommendation to eat 90 g of free sugars. The WHO limit for free sugars is about 50 g.

**4. Judge "high" and "low" with thresholds.** The UK "traffic light" criteria are a handy reference, per 100 g of food:

| | Low (green) | Medium (amber) | High (red) |
|---|---|---|---|
| Fat | ≤ 3 g | 3–17.5 g | > 17.5 g |
| Saturates | ≤ 1.5 g | 1.5–5 g | > 5 g |
| Sugars | ≤ 5 g | 5–22.5 g | > 22.5 g |
| Salt | ≤ 0.3 g | 0.3–1.5 g | > 1.5 g |

For drinks, the limits are half as high (salt: 0.75 g for high).

## Claims on the front

Claims are regulated in the EU. Some useful ones:

- **"Fără zahăr adăugat"** (no added sugar): no sugar was added, but the food may still be sweet from fruit or milk.
- **"Sursă de fibre"** (source of fiber): at least 3 g per 100 g; **"bogat în fibre"** (high fiber): at least 6 g.
- **"Sursă de proteine"**: at least 12 % of the energy from protein; **"bogat în proteine"**: at least 20 %.
- **"Light"** or **"redus"**: at least 30 % less of something (fat, sugar, energy) than similar products. A "light" product can still be high in it.

Words like *natural*, *tradițional*, *de casă*, *fitness* or *wellness* have no nutritional meaning.

## Try it

The attached `label-check.js` does all of the above for any label. A chocolate biscuit, per 100 g, eating a 40 g portion:

```bash
node label-check.js --kcal 452 --fat 22 --sat 9.5 --carbs 57 --sugars 31 --fiber 2.4 --protein 5.8 --salt 0.6 --portion 40
```

```
Per 100 g:
  Fat           22 g  HIGH  (red)
  Saturates    9.5 g  HIGH  (red)
  Sugars        31 g  HIGH  (red)
  Salt         0.6 g  MEDIUM (amber)

Energy check: 454 kcal computed from the nutrients vs 452 kcal on the label
  from fat 44 %, carbohydrate 50 %, protein 5 %, fiber 1 %
  sugars are 54 % of the carbohydrate

One portion of 40 g, as % of the reference intake:
  Energy         181 kcal    9 %
  Fat               8.8 g   13 %
  Saturates         3.8 g   19 %
  ...
Protein density: 1.3 g per 100 kcal  (eggs ~8.8, lentils ~7, bread ~3.5, biscuits ~1.3)
```

The **energy check** recomputes the energy with the formula $E = 9F + 4C + 4P + 2\,\text{Fib}$. If it is far from the label, you probably mistyped a number. It also shows where the energy comes from: in this biscuit, 44 % from fat.

Now try plain milk (`--drink`): its "sugars" are 100 % of the carbohydrate, but they are lactose, not added sugar. The label alone can't tell you; the ingredient list can.
