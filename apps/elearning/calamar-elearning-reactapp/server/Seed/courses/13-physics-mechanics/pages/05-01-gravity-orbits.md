# Gravity, Kepler's laws and orbits

## Newton's law of universal gravitation

Every mass attracts every other mass, with a force proportional to both masses and inversely proportional to the square of their distance:

$$
F = \frac{G M m}{r^2}, \qquad G = 6.674 \times 10^{-11}\ \text{N m}^2/\text{kg}^2
$$

$G$ is tiny: two 1 kg masses 1 m apart attract with less than a ten-billionth of a newton. Gravity matters only when at least one mass is enormous. It was first measured in the laboratory by Henry Cavendish in 1798, with lead spheres and a torsion balance, which also gave the first estimate of the mass of the Earth.

At the Earth's surface, $F = mg$, so:

$$
g = \frac{GM_E}{R_E^2} = \frac{6.674 \times 10^{-11} \times 5.972 \times 10^{24}}{(6.371 \times 10^{6})^2} = 9.82\ \text{m/s}^2
$$

```bash
node gravity.js bodies
```

```
body       surface g (m/s²)   escape speed (km/s)
Sun             274.27            617.75
Mercury           3.70              4.25
Venus             8.87             10.36
Earth             9.82             11.19
Moon              1.62              2.38
Mars              3.73              5.03
Jupiter          25.92             60.20
Saturn           11.19             36.09
```

(The value of $g$ you measure is a little less than 9.82, and varies with place, because the Earth spins and isn't a perfect sphere: 9.78 m/s² at the equator, 9.83 at the poles.)

## Newton's cannonball: what an orbit is

Imagine a cannon on a very high mountain. Fire a ball faster and it lands farther away. Fire it fast enough, and the ground curves away beneath it as fast as it falls: it falls forever, all the way around. That is an orbit. An astronaut in orbit is weightless not because there is no gravity (at the Space Station's height it is 89 % of its surface value) but because she and her station are falling together.

For a circular orbit, gravity provides the centripetal force:

$$
\frac{GMm}{r^2} = \frac{mv^2}{r} \quad\Rightarrow\quad v = \sqrt{\frac{GM}{r}}, \qquad T = 2\pi\sqrt{\frac{r^3}{GM}}
$$

```bash
node gravity.js orbit 400
```

```
altitude 400 km, radius 6771 km
speed v = sqrt(GM/r) = 7.672 km/s
period T = 2 pi r / v = 92.4 min
gravity there: 8.69 m/s² (89 % of the surface value)
escape speed from there: 10.850 km/s (sqrt 2 times the orbital speed)
```

The International Space Station circles the Earth about every 92 minutes, 15 to 16 times a day.

### The geostationary orbit

A satellite whose period is exactly one rotation of the Earth (a **sidereal** day, 23 h 56 min 4 s), orbiting over the equator, stays above the same point on the ground: ideal for TV and weather satellites.

```bash
node gravity.js geo
```

```
period: one sidereal day = 86164.1 s
radius r = (GM T^2 / 4 pi^2)^(1/3) = 42163 km, altitude 35792 km
speed 3.075 km/s
```

(The usual figure is 35,786 km, measured from the equatorial radius, 6,378 km; the script uses the mean radius, 6,371 km.)

## Kepler's laws

Johannes Kepler found three laws in the planetary observations of Tycho Brahe, between 1609 and 1619, long before anyone could explain them. Newton derived all three from his law of gravitation.

1. **Planets move in ellipses**, with the Sun at one focus.
2. **A line from the Sun to a planet sweeps equal areas in equal times**: planets move faster when they are closer to the Sun. (This is conservation of angular momentum.)
3. **The square of the period is proportional to the cube of the semi-major axis**, $T^2 \propto a^3$. In years and astronomical units (the Earth's distance), $T^2 / a^3 = 1$:

```bash
node gravity.js kepler
```

```
planet     a (AU)   T (years)   T^2 / a^3
Mercury     0.387      0.241     1.0021
Venus       0.723      0.615     1.0008
Earth       1.000      1.000     1.0000
Mars        1.524      1.881     0.9996
Jupiter     5.203     11.860     0.9986
Saturn      9.537     29.460     1.0005
Uranus     19.190     84.010     0.9987
Neptune    30.070    164.800     0.9989
```

From Mercury to Neptune, a factor of 80 in distance and 700 in period, the ratio stays at 1 to within a fraction of a percent. Newton's version, $T^2 = 4\pi^2 a^3 / GM$, lets astronomers **weigh** anything that has something in orbit around it: the Sun from the planets, Jupiter from its moons, and the 4-million-solar-mass black hole at the center of our galaxy from the stars that orbit it.

## Escape speed

How fast must you launch something so that it never comes back? Its kinetic energy must cover the gravitational potential energy, $-GMm/r$, all the way to infinity:

$$
\tfrac12 m v_{\text{esc}}^2 = \frac{GMm}{r} \quad\Rightarrow\quad v_{\text{esc}} = \sqrt{\frac{2GM}{r}} = \sqrt{2}\, v_{\text{orbit}}
$$

From the Earth's surface, 11.2 km/s; from the Moon, only 2.4 km/s, which is why the Moon has kept no atmosphere: gas molecules moving at a fraction of that speed slowly leak away.

## Changing orbits: the Hohmann transfer

To go from a low orbit to a high one, the most fuel-efficient two-burn path (Walter Hohmann, 1925) is half an ellipse touching both orbits. The speed at each point of an orbit with semi-major axis $a$ is given by the **vis-viva equation**:

$$
v^2 = GM\left(\frac{2}{r} - \frac{1}{a}\right)
$$

```bash
node gravity.js hohmann 400 35786
```

```
from a circular orbit at 400 km to one at 35786 km, through an ellipse with a = 24464 km

burn 1 at 400 km: 7.672 -> 10.072 km/s, delta-v 2.399 km/s
coast for half an ellipse: 5.29 h
burn 2 at 35786 km: 1.618 -> 3.075 km/s, delta-v 1.457 km/s
total delta-v: 3.856 km/s
```

Speed up to climb, then speed up again to stay high. The surprise of orbital mechanics: the higher orbit is **slower** (3.1 km/s against 7.7), although getting there took two forward burns.

## Check yourself

1. Use the table: how much would a 70 kg person weigh on Mars? On Jupiter (if they could stand there)?
2. The Moon orbits at 384,000 km from the Earth's center. Use $T = 2\pi\sqrt{r^3/GM}$ with $GM_E = 3.986 \times 10^{14}$ m³/s² to compute its period in days.
3. Run `node gravity.js hohmann 400 384000`. How does the total $\Delta v$ to reach the Moon's distance compare with that to geostationary orbit?
