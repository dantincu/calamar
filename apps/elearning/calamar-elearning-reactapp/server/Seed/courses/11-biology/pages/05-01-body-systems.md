# A tour of the body's systems

Your cells need a steady supply of oxygen and fuel, a way to get rid of waste, a stable temperature and chemistry, coordination, and defense. Each **organ system** handles part of the job, and together they maintain **homeostasis**.

## Circulation: the delivery network

The **heart** pumps blood through two circuits: the right side to the lungs, the left side to the rest of the body. Arteries carry blood away from the heart; veins bring it back; **capillaries**, with walls one cell thick, are where exchange happens (remember the diffusion times from the cells page).

The heart's output per minute is easy to estimate:

$$
\text{cardiac output} = \text{heart rate} \times \text{stroke volume} \approx 70\ \text{/min} \times 70\ \text{mL} \approx 4.9\ \text{L/min}
$$

about your whole blood volume (roughly 5 L) every minute. During hard exercise it can rise four- to five-fold. **Red blood cells**, about 5 million per microliter, carry oxygen bound to **hemoglobin**: four protein chains, each holding an iron atom that binds one O₂.

## Respiration: gas exchange

You breathe about 12–16 times a minute, about 0.5 L each time, so 6–8 L of air a minute at rest. In the lungs, air reaches about 300–500 million **alveoli**, tiny sacs with a total surface of around 70 m² (a large flat) and a barrier less than 1 µm thick. Oxygen diffuses into the blood and CO₂ out.

Breathing is controlled mainly by **CO₂**, not oxygen: when CO₂ rises, the blood becomes more acidic, and the brainstem increases breathing.

## Digestion: fuel and building blocks

Digestion **hydrolyzes** food polymers into monomers (starch into glucose, proteins into amino acids, fats into fatty acids), with enzymes from the saliva, stomach, pancreas and small intestine. The small intestine absorbs them through a surface multiplied by folds, villi and microvilli. The large intestine absorbs water and hosts trillions of bacteria, which ferment fiber.

## Excretion: the kidneys

The kidneys filter the blood plasma, about 125 mL per minute:

$$
125\ \text{mL/min} \times 1440\ \text{min/day} = 180\ \text{L/day}
$$

and then reabsorb more than 99 % of the water and everything useful, leaving 1–2 L of urine. The point of filtering so much is control: by adjusting what they reabsorb, the kidneys set the blood's water, salt, acidity and pressure.

## The nervous system: electrical signals

A **neuron** keeps a voltage across its membrane, about $-70$ mV inside relative to outside. The voltage comes from ion gradients, which pumps maintain: potassium (K⁺) is concentrated inside the cell, sodium (Na⁺) outside. For each ion, the **Nernst equation** gives the voltage at which its tendency to diffuse is exactly balanced by the electric force:

$$
E = \frac{RT}{zF} \ln \frac{[\text{ion}]_{\text{out}}}{[\text{ion}]_{\text{in}}}
$$

with $R = 8.314$ J/(mol·K), $T$ the temperature in kelvin, $z$ the ion's charge and $F = 96\,485$ C/mol. At body temperature (310 K), $RT/F \approx 26.7$ mV. For potassium (5 mM outside, 140 mM inside):

$$
E_{\text{K}} = 26.7\ \text{mV} \times \ln \frac{5}{140} \approx -89\ \text{mV}
$$

and for sodium (145 mM outside, 12 mM inside), $E_{\text{Na}} \approx +67$ mV. The resting membrane is mostly permeable to K⁺, so it sits near $E_{\text{K}}$. During a nerve impulse, the **action potential**, sodium channels open for about a millisecond and the voltage shoots toward $E_{\text{Na}}$, then potassium channels bring it back. The impulse travels along the axon at 1 to about 100 m/s, fastest in nerves insulated with **myelin**.

At a **synapse**, the signal crosses to the next cell as a chemical, a **neurotransmitter**. The brain has about 86 billion neurons and on the order of $10^{14}$ synapses.

## The endocrine system: hormones

Hormones are chemical messages carried by the blood: slower than nerves, but reaching every cell. Insulin and glucagon, from the pancreas, keep blood glucose around 4–6 mmol/L: insulin lowers it after a meal, glucagon raises it between meals. This is **negative feedback**, the principle of most homeostasis: a change triggers a response that undoes it, like a thermostat.

## The immune system: defense

- **Innate immunity**: barriers (skin, mucus), inflammation, and cells that engulf invaders. Fast and general.
- **Adaptive immunity**: **B cells** make **antibodies** that bind specific targets; **T cells** kill infected cells and coordinate the response. Slow the first time (one to two weeks), but it leaves **memory cells**, so the second encounter is fast. That is how **vaccines** work: they train the adaptive system with a harmless version of the target.

Vaccination also protects people who aren't vaccinated. If each case of a disease infects $R_0$ others in a fully susceptible population, an epidemic can't grow once the fraction of immune people exceeds:

$$
1 - \frac{1}{R_0}
$$

For measles, with $R_0$ of about 12–18, that is 92–94 %, which is why measles returns as soon as vaccination coverage falls a few points.

## Check yourself

1. Your resting heart rate is 60 and your stroke volume 80 mL. What is your cardiac output?
2. If the potassium outside the cells rose to 10 mM, what would happen to $E_{\text{K}}$, and so to the resting potential? (This is why high blood potassium is dangerous for the heart.)
3. A disease has $R_0 = 4$. What fraction of the population must be immune to prevent outbreaks?
