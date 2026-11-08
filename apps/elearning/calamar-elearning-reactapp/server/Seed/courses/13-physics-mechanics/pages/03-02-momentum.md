# Momentum, collisions and rockets

## Momentum

The **momentum** of an object is its mass times its velocity, a vector:

$$
\vec p = m\vec v
$$

Newton actually wrote his second law in terms of momentum: the net force is the rate of change of momentum, $\vec F = d\vec p/dt$. Over a short time $\Delta t$, a force $F$ changes the momentum by the **impulse**:

$$
\Delta p = F\, \Delta t
$$

The same change in momentum can come from a large force for a short time or a smaller force for longer. That is how **airbags, crumple zones and crash helmets** protect: by stretching the stopping time, they reduce the force. A 70 kg passenger stopping from 50 km/h (13.9 m/s) in 0.01 s against a hard dashboard feels an average force of $70 \times 13.9 / 0.01 \approx 97{,}000$ N; spread over 0.1 s by an airbag and a seat belt, ten times less.

## Conservation of momentum

When objects interact only with each other, the forces between them are equal and opposite (Newton's third law), so the momentum one gains, the other loses. The **total momentum of an isolated system is constant**:

$$
m_1 \vec v_1 + m_2 \vec v_2 = m_1 \vec v_1' + m_2 \vec v_2'
$$

This holds in every collision, however violent and whatever the forces, which is what makes it so useful.

## Collisions

Kinetic energy, unlike momentum, may be lost in a collision (to heat, sound and deformation). How much depends on the **coefficient of restitution** $e$, the ratio of the speed at which the objects separate to the speed at which they approached:

- $e = 1$: **elastic**, no kinetic energy lost (billiard balls, nearly; atoms);
- $0 < e < 1$: **inelastic** (most real collisions);
- $e = 0$: **perfectly inelastic**, the objects stick together.

Momentum conservation plus $e$ give the final velocities. Two equal masses, one at rest, elastic:

```bash
node collide.js 1 2 1 0
```

```
coefficient of restitution e = 1 (elastic)

           v1 (m/s)   v2 (m/s)   momentum (kg m/s)   kinetic energy (J)
before       2.000      0.000            2.000              2.000
after        0.000      2.000            2.000              2.000
```

The first ball stops dead, the second takes all its velocity: Newton's cradle. If they stick together instead:

```bash
node collide.js 1 2 1 0 0
```

```
after        1.000      1.000            2.000              1.000

kinetic energy lost: 1.000 J (50.0 %), turned into heat, sound and deformation
```

Momentum is the same, but half the kinetic energy is gone. A light ball bouncing off a heavy one (a 60 g tennis ball against a 6 kg mass) bounces back with almost its full speed:

```bash
node collide.js 0.06 1 6 0
```

```
after       -0.980      0.020            0.060              0.030
```

**Two cars, head on.** A 1,000 kg car at 20 m/s hits a 1,500 kg car coming the other way at 10 m/s, with $e = 0.1$:

```bash
node collide.js 1000 20 1500 -10 0.1
```

```
           v1 (m/s)   v2 (m/s)   momentum (kg m/s)   kinetic energy (J)
before      20.000    -10.000         5000.000         275000.000
after        0.200      3.200         5000.000           7700.000

kinetic energy lost: 267300.000 J (97.2 %), turned into heat, sound and deformation
center of mass velocity: 2.000 m/s, unchanged by the collision
velocity change of body 1: 19.800 m/s; of body 2: 13.200 m/s
```

Almost all the kinetic energy goes into crushing metal (which is what crumple zones are designed to do). Note the velocity changes: the lighter car's occupants suffer a change of 19.8 m/s, the heavier car's only 13.2 m/s. In a collision, the lighter vehicle always gets the larger change in velocity, in the ratio of the masses.

## Rockets

A rocket throws mass (exhaust gas) backwards at high speed, and by momentum conservation it moves forward. As it burns fuel, it gets lighter, so the same thrust accelerates it more. Konstantin Tsiolkovsky derived the result in 1903:

$$
\Delta v = v_e \ln\frac{m_0}{m_f}
$$

where $v_e$ is the exhaust speed, $m_0$ the starting mass and $m_f$ the final (empty) mass. The logarithm is harsh: to double $\Delta v$, you must *square* the mass ratio.

```bash
node motion.js rocket 4400 0.9
```

```
delta-v = ve ln(m0/mf) = 4400 x ln(1/0.10) = 10131 m/s
```

A rocket that is 90 % propellant, with the best chemical engines (hydrogen and oxygen, $v_e \approx 4.4$ km/s), reaches about 10 km/s, a little more than the roughly 9.4 km/s needed to reach low Earth orbit (7.8 km/s orbital speed plus losses to gravity and drag). But the 10 % left must include the engines, the tanks and the payload. That is why rockets have **stages**: dropping empty tanks along the way improves the mass ratio of what is left.

## Check yourself

1. A 0.16 kg cricket ball arrives at 30 m/s and is hit straight back at 40 m/s. What impulse does the bat give it? If contact lasts 1 ms, what is the average force?
2. Use `node collide.js` to find what happens when a moving ball hits an identical ball at rest with $e = 0.5$. What fraction of the kinetic energy is lost?
3. With $v_e = 3$ km/s, what mass ratio $m_0/m_f$ does a single-stage rocket need for $\Delta v = 9.4$ km/s?
