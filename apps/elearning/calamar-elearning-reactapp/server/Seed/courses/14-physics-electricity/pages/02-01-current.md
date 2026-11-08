# Current, resistance and power

## Current

**Electric current** is the rate at which charge flows past a point:

$$
I = \frac{\Delta Q}{\Delta t}
$$

measured in **amperes** (1 A = 1 C/s). By convention, current flows from $+$ to $-$, the direction positive charges would move. In metal wires it is carried by electrons, which drift the other way: Franklin guessed the sign before electrons were known.

The electrons themselves move surprisingly slowly. In a copper wire with a cross-section of 1 mm² carrying 1 A, with about $8.5 \times 10^{28}$ free electrons per cubic meter, the **drift velocity** is:

$$
v_d = \frac{I}{n e A} = \frac{1}{8.5 \times 10^{28} \times 1.602 \times 10^{-19} \times 10^{-6}} \approx 7 \times 10^{-5}\ \text{m/s}
$$

less than a tenth of a millimeter per second. A light comes on instantly because the *signal*, the electric field, travels along the wire at a large fraction of the speed of light, setting all the electrons in motion at once, like water in a full hose.

## Resistance and Ohm's law

Pushing current through a material takes a voltage. For many materials (metals at constant temperature, for example) the current is proportional to the voltage: **Ohm's law** (Georg Ohm, 1827):

$$
V = IR
$$

The **resistance** $R$, in **ohms** (Ω), depends on the material and the shape:

$$
R = \rho\frac{L}{A}
$$

where $L$ is the length, $A$ the cross-section and $\rho$ the **resistivity** of the material:

| Material | $\rho$ (Ω·m, at 20 °C) |
|---|---|
| silver | $1.59 \times 10^{-8}$ |
| copper | $1.68 \times 10^{-8}$ |
| aluminium | $2.65 \times 10^{-8}$ |
| nichrome (heating elements) | $1.1 \times 10^{-6}$ |
| sea water | about 0.2 |
| glass | $10^{10}$ to $10^{14}$ |

A 10 m extension cord with 1.5 mm² copper wires (20 m of wire there and back) has $R = 1.68 \times 10^{-8} \times 20 / 1.5 \times 10^{-6} = 0.22$ Ω: small, but enough to warm it noticeably under a heavy load.

The resistance of metals rises with temperature. Some materials (**superconductors**) lose all resistance below a critical temperature: mercury below 4.2 K (Heike Kamerlingh Onnes, 1911), some ceramics below about 130 K. They make the strong magnets of MRI scanners possible.

## Electric power

A current $I$ flowing through a voltage drop $V$ transfers energy at the rate:

$$
P = VI = I^2 R = \frac{V^2}{R}
$$

in watts. In a resistor, it becomes heat (**Joule heating**): useful in a kettle or a toaster, wasted in a power line.

**Example: a kettle.** A 2,000 W kettle on 230 V draws $I = P/V = 8.7$ A, and its element has $R = V^2/P = 26$ Ω.

**Why the grid uses high voltage.** A power line delivers power $P = VI$ and loses $I^2R$ in its wires. For the same power, raising the voltage tenfold cuts the current tenfold and the losses **a hundredfold**. That is why long-distance lines run at 220–400 kV (750 kV in some countries), and why we need transformers (see the induction chapter) to step the voltage down for homes.

## Energy and the kilowatt-hour

Electricity bills count energy in **kilowatt-hours**: $1\ \text{kWh} = 1000\ \text{W} \times 3600\ \text{s} = 3.6$ MJ.

| Appliance | Power | Use | Energy |
|---|---|---|---|
| LED bulb | 8 W | 5 h/day for a month | 1.2 kWh |
| fridge | about 1 kWh/day | a month | about 30 kWh |
| kettle | 2 kW | 10 min/day for a month | 10 kWh |
| electric car | about 15–20 kWh/100 km | 1,000 km | 150–200 kWh |

## Check yourself

1. A phone charger supplies 5 V at 2 A. What power? How much charge passes in an hour?
2. What length of nichrome wire with a 0.2 mm² cross-section makes a 26 Ω heating element?
3. A 100 km line with a resistance of 5 Ω carries 100 MW. Compare the power lost at 100 kV and at 400 kV.
