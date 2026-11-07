# How much energy you need

Nobody can measure your energy needs exactly without a lab, but two formulas get most people within about 10 %. That is good enough to start, as long as you then **adjust from what your body weight does**.

## Step 1: resting energy (BMR)

The **Mifflin–St Jeor equation** (1990) is the most accurate of the simple formulas for healthy adults. With weight $W$ in kg, height $H$ in cm and age $A$ in years:

$$
\text{BMR} = 10\,W + 6.25\,H - 5\,A + s, \qquad s = \begin{cases} +5 & \text{men} \\ -161 & \text{women} \end{cases}
$$

For a 30-year-old woman, 65 kg and 168 cm:

$$
\text{BMR} = 650 + 1050 - 150 - 161 = 1389\ \text{kcal/day}
$$

Notice what drives it: weight and height (more tissue burns more energy), and age (resting metabolism falls slowly, mostly because muscle mass does).

## Step 2: total energy (TDEE)

Multiply by a **physical activity level** (PAL):

$$
\text{TDEE} = \text{BMR} \times \text{PAL}
$$

| Activity | PAL |
|---|---|
| sedentary: desk job, little exercise | 1.2 |
| light: exercise 1–3 days a week | 1.375 |
| moderate: exercise 3–5 days a week | 1.55 |
| active: hard exercise 6–7 days a week | 1.725 |
| very active: physical job plus training | 1.9 |

For our example with moderate activity: $1389 \times 1.55 \approx 2153$ kcal/day.

People overestimate their activity much more often than they underestimate it. If you are unsure between two levels, choose the lower one. Walking about 10 000 steps a day, with no other exercise, is roughly "light".

## Step 3: adjust for a goal

- **Maintain**: eat about the TDEE.
- **Lose weight**: a deficit of about 500 kcal/day is a common starting point. Don't go below about $1.1 \times \text{BMR}$ without supervision: very low intakes make it hard to get enough protein and micronutrients, and are hard to keep up.
- **Gain** (for example while building muscle): about 300 kcal/day above the TDEE.

## Step 4: let the scale correct the formula

The formula is a starting point; your weight is the measurement. Weigh yourself under the same conditions (morning, after the toilet, before eating) several times a week, and compare **weekly averages**, because daily weight jumps by 1–2 kg with water and the contents of your gut.

If the weekly average hasn't moved after 3–4 weeks at "maintenance", your maintenance is what you are eating. If you are losing, about 0.5–1 % of body weight per week is a sustainable pace.

## Body size: BMI and waist

The **body mass index** is

$$
\text{BMI} = \frac{W}{h^2} \quad [\text{kg/m}^2,\ h \text{ in metres}]
$$

with the WHO categories: below 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, 30 and above obesity. BMI is a screening tool for populations: it can't tell muscle from fat, so a muscular person can be "overweight".

Where fat is stored matters more than how much you weigh. Fat around the waist (visceral fat) is the kind linked to diabetes and heart disease. A simple check is the **waist-to-height ratio**:

$$
\text{WHtR} = \frac{\text{waist}}{\text{height}} < 0.5
$$

"Keep your waist to less than half your height" works for adults of any height and sex. Measure the waist halfway between the lowest rib and the top of the hip bone, after breathing out.

## Try it

The attached `nutrition-calc.js` implements every formula on this page and the targets of the next chapters:

```bash
node nutrition-calc.js --sex m --age 45 --weight 92 --height 180 --activity light --goal lose --waist 98
```

```
BMI              28.4 kg/m2 (overweight)
Waist-to-height  0.54 (0.5 or more: increased risk)
BMR              1825 kcal/day (Mifflin-St Jeor)
TDEE             2509 kcal/day (x 1.375)
Energy target    2009 kcal/day
Protein          76-184 g
...
```

Check the BMR by hand: $10(92) + 6.25(180) - 5(45) + 5 = 920 + 1125 - 225 + 5 = 1825$.
