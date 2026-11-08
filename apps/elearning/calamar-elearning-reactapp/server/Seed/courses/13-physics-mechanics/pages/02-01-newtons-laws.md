# Newton's laws

## The first law: inertia

> An object stays at rest, or keeps moving in a straight line at constant speed, unless a net force acts on it.

This was revolutionary. For two thousand years, following Aristotle, people thought that moving things naturally come to rest, and that motion needs a constant push. Galileo and Newton saw that things *do* keep moving: they stop only because of friction and air resistance, which are forces. A puck on ice slides far; a spacecraft coasts for years.

**Inertia** is the tendency to keep moving as before, and **mass** is its measure. That is why you lurch forward when a bus brakes: your body keeps going.

## The second law: force and acceleration

> The net force on an object equals its mass times its acceleration.

$$
\vec F_{\text{net}} = m\vec a
$$

The unit of force is the **newton**: 1 N accelerates 1 kg at 1 m/s². (An apple weighs about 1 N.) Force is a vector, so the second law holds for each component separately: $F_x = m a_x$, $F_y = m a_y$.

Two points matter:

- **net** force: the vector sum of all forces. A car at constant speed on a motorway has a large engine force, but it is balanced by drag and friction: net force zero, acceleration zero.
- the same force accelerates a small mass more: a push that sends a shopping trolley rolling barely moves a car.

## The third law: action and reaction

> When object A exerts a force on object B, B exerts an equal and opposite force on A.

When you push on a wall, it pushes back on you. A rocket pushes exhaust gas backwards, and the gas pushes the rocket forwards: no air is needed, which is why rockets work in space. The Earth pulls you down with a force equal to your weight, and you pull the Earth up with the same force; its huge mass means its acceleration is imperceptible.

The two forces of a pair act on **different objects**, so they never cancel each other. A horse can pull a cart because what matters for the cart is the forces *on the cart*.

## Weight and mass

Your **weight** is the gravitational force on you:

$$
W = mg
$$

A 70 kg person weighs $70 \times 9.81 = 687$ N on Earth, and only 113 N on the Moon ($g = 1.62$ m/s²), but their mass is 70 kg everywhere. Bathroom scales measure the force with which you press on them and convert it to kilograms assuming Earth's $g$.

## Free-body diagrams

To apply the second law, draw the object alone, with **every force acting on it** as an arrow, then add them as vectors. Common forces:

| Force | Direction |
|---|---|
| weight $mg$ | down |
| normal force $N$ | perpendicular to a surface, pushing away from it |
| tension $T$ | along a rope, pulling |
| friction $f$ | along a surface, against the (attempted) motion |
| drag | against the velocity |

**Example: the lift.** You stand on a scale in a lift that accelerates upward at 2 m/s². Forces on you: weight $mg$ down, normal force $N$ up (what the scale reads). Second law, upward positive:

$$
N - mg = ma \quad\Rightarrow\quad N = m(g + a) = 70 \times 11.81 = 827\ \text{N}
$$

You feel 20 % heavier. When the lift accelerates downward, you feel lighter; if the cable snapped ($a = -g$), $N = 0$: you would be **weightless**, like astronauts in orbit, who are in constant free fall.

**Example: two blocks and a pulley** (an Atwood machine). Masses of 3 kg and 2 kg hang on either side of a light pulley. The heavier one goes down. Treat them as one system pulled by the difference in their weights:

$$
a = \frac{(m_1 - m_2)g}{m_1 + m_2} = \frac{(3 - 2) \times 9.81}{5} = 1.96\ \text{m/s}^2
$$

and the tension in the string, from the second law for the lighter block, is $T = m_2(g + a) = 2 \times 11.77 = 23.5$ N, between the two weights (19.6 N and 29.4 N), as it must be.

## Check yourself

1. A 1,200 kg car accelerates from 0 to 20 m/s in 10 s. What net force acts on it?
2. A book rests on a table. Name the force that forms a third-law pair with the book's weight. (Careful: it isn't the normal force.)
3. In the lift example, what does the scale read when the lift moves upward at a *constant* 2 m/s?
