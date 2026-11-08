# Position, velocity and acceleration

## Scalars and vectors

Some quantities have only a size: mass, time, temperature, energy. They are **scalars**. Others also have a direction: displacement, velocity, force. They are **vectors**, written in bold or with an arrow, $\vec v$.

In two dimensions, a vector has components along $x$ and $y$. A velocity of 20 m/s at 30° above the horizontal is:

$$
v_x = 20\cos 30° = 17.3\ \text{m/s}, \qquad v_y = 20\sin 30° = 10.0\ \text{m/s}
$$

and back again, by Pythagoras and trigonometry: $|\vec v| = \sqrt{v_x^2 + v_y^2}$, $\theta = \arctan(v_y / v_x)$. Vectors add component by component. Most of mechanics consists of treating $x$ and $y$ separately, then putting them back together.

## Velocity

The **average velocity** over a time interval is the displacement divided by the time:

$$
\bar v = \frac{\Delta x}{\Delta t}
$$

Make the interval very short and you get the **instantaneous velocity**, the rate of change of position, the derivative $v = dx/dt$. On a graph of position against time, it is the slope.

**Speed** is the size of the velocity, without direction. A car going round a roundabout at a constant 30 km/h has a constant speed but a changing velocity.

## Acceleration

**Acceleration** is the rate of change of velocity, $a = dv/dt$, in m/s². A car going from 0 to 100 km/h (27.8 m/s) in 8 seconds has an average acceleration of $27.8 / 8 = 3.5$ m/s².

Near the Earth's surface, all objects in free fall, without air resistance, have the same downward acceleration, $g = 9.81$ m/s². Galileo was the first to argue this, against the ancient view that heavy things fall faster. On the Moon, in 1971, the astronaut David Scott dropped a hammer and a feather together: they landed at the same moment.

## Motion with constant acceleration

When the acceleration is constant, four equations describe the motion. With initial velocity $v_0$, acceleration $a$, time $t$ and displacement $x$:

$$
v = v_0 + at
$$

$$
x = v_0 t + \tfrac{1}{2} a t^2
$$

$$
v^2 = v_0^2 + 2ax
$$

$$
x = \tfrac{1}{2}(v_0 + v)\,t
$$

Each leaves out one quantity, so pick the one that contains what you know and what you want.

**Example: braking distance.** A car at 50 km/h (13.9 m/s) brakes at 7 m/s² (a good road). Using the third equation with $v = 0$:

$$
x = \frac{v_0^2}{2|a|} = \frac{13.9^2}{14} = 13.8\ \text{m}
$$

At 100 km/h, the braking distance is **four times** as long, 55 m, because it grows with the square of the speed. Add the reaction time (about 1 s, during which the car keeps going at full speed: 14 m at 50 km/h, 28 m at 100 km/h) and you get the total stopping distance.

**Example: a dropped stone.** How deep is a well if a stone takes 2.0 s to reach the water? With $v_0 = 0$ and $a = g$: $x = \frac12 \times 9.81 \times 2.0^2 = 19.6$ m (a little less in reality, because the sound needs time to come back, and the air slows the stone).

## Relative motion

Velocities are always measured relative to something. A passenger walking forward at 1.5 m/s in a train moving at 30 m/s moves at 31.5 m/s relative to the ground. Galileo saw that the laws of motion are the same in any frame moving at constant velocity: in a smooth train, a dropped cup falls straight down, as it would at the station. (Einstein's special relativity refines how velocities add near the speed of light; for everyday speeds, simple addition is accurate to many decimal places.)

## Check yourself

1. A cyclist accelerates from rest at 1.5 m/s² for 6 s. How fast is she going, and how far has she traveled?
2. You throw a ball straight up at 15 m/s. How high does it rise, and when does it come back to your hand?
3. Why does doubling your speed more than double your stopping distance?
