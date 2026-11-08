# Work, energy and power

## Work

A force does **work** when it moves something. For a constant force $F$ along a displacement $d$, at an angle $\theta$ between them:

$$
W = F d \cos\theta
$$

measured in **joules** (1 J = 1 N·m). Only the part of the force along the motion counts. Carrying a bag horizontally at constant speed does no work on it in this sense (your arms get tired for physiological reasons); lifting it does.

## Kinetic energy

Do work on a mass $m$ starting from rest, with a constant net force, and it ends up with speed $v$. Combining $F = ma$ with $v^2 = 2ad$:

$$
W = Fd = ma \cdot \frac{v^2}{2a} = \tfrac12 m v^2
$$

That quantity is the **kinetic energy**, $K = \frac12 mv^2$. In general the **work-energy theorem** says: the net work done on an object equals its change in kinetic energy.

The square of the speed matters a lot. A car at 100 km/h has four times the kinetic energy of the same car at 50 km/h, and the brakes must turn all of it into heat: back to the stopping distances of the first chapter.

## Potential energy

Lift a mass $m$ by a height $h$ against gravity, and you do work $mgh$. That energy is stored, ready to be released if it falls: the **gravitational potential energy**:

$$
U = mgh
$$

A stretched or compressed spring stores **elastic potential energy**: the spring force grows with the stretch $x$, $F = -kx$ (Hooke's law), and the stored energy is $U = \frac12 kx^2$.

## Conservation of energy

When only gravity and springs do work (no friction, no drag), the total mechanical energy is constant:

$$
K + U = \tfrac12 mv^2 + mgh = \text{constant}
$$

This solves problems where the path is complicated. **A roller coaster** starts from rest 40 m above the bottom of its first drop. How fast is it at the bottom?

$$
mgh = \tfrac12 mv^2 \quad\Rightarrow\quad v = \sqrt{2gh} = \sqrt{2 \times 9.81 \times 40} = 28\ \text{m/s} \approx 101\ \text{km/h}
$$

The shape of the track doesn't matter, nor does the mass. (The real coaster is a little slower, because friction and drag turn some energy into heat.)

**A pendulum** released from a height $h$ above its lowest point passes the bottom at $v = \sqrt{2gh}$, and swings up to the same height on the other side.

When friction acts, mechanical energy is not conserved, but **total** energy is: it is converted into heat, sound and deformation. Energy is never created or destroyed, only converted, one of the most thoroughly tested laws in physics.

## Power

**Power** is the rate of doing work, or of converting energy:

$$
P = \frac{W}{t} = F v
$$

measured in **watts** (1 W = 1 J/s). A person climbing stairs: 70 kg rising 3 m in 4 s produces $70 \times 9.81 \times 3 / 4 = 515$ W of useful power, more than half a horsepower (1 hp ≈ 746 W) and only sustainable for a short time. A trained cyclist can keep up 250–400 W for an hour.

**Example: the power to drive.** At constant speed, the engine's force balances drag and rolling resistance. Drag grows with $v^2$, so the power to overcome it grows with $v^3$:

$$
P_{\text{drag}} = F_D v = \tfrac12\rho C_d A v^3
$$

For a car with $C_d A = 0.7$ m²: at 90 km/h (25 m/s), $0.5 \times 1.2 \times 0.7 \times 25^3 = 6.6$ kW; at 130 km/h (36.1 m/s), 19.8 kW, three times as much for 44 % more speed. That is why fuel consumption rises so steeply on the motorway.

## Energy in everyday units

| | Energy |
|---|---|
| lifting 1 kg by 1 m | 9.8 J |
| a 100 W bulb for 1 hour (1 kWh = 3.6 MJ) | 360 kJ |
| a slice of bread (80 kcal) | 335 kJ |
| a car at 100 km/h (1,200 kg) | 463 kJ |
| 1 liter of petrol | about 32 MJ |

A liter of petrol holds about 70 times the kinetic energy of a car at motorway speed. Food energy is large too: climbing 1,000 m of mountain with a 70 kg body takes $mgh = 687$ kJ of mechanical work, about two slices of bread, but muscles are only about 25 % efficient, so you need about four times as much food energy.

## Check yourself

1. A 0.5 kg ball is dropped from 20 m. What is its speed just before it hits the ground? What is its kinetic energy?
2. A spring with $k = 400$ N/m is compressed by 10 cm and launches a 50 g ball upward. How high does the ball rise?
3. A 1,000 kg lift rises 30 m in 15 s at constant speed. What power does its motor deliver?
