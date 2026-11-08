# Projectiles

A **projectile** is anything thrown, kicked or fired that then moves under gravity alone. Galileo's key insight: the horizontal and vertical motions are **independent**. Horizontally, nothing pushes (ignoring air), so the velocity is constant. Vertically, the projectile accelerates down at $g$.

## The equations

Launch at speed $v_0$ and angle $\theta$ above the horizontal:

$$
x = (v_0 \cos\theta)\, t, \qquad y = (v_0 \sin\theta)\, t - \tfrac12 g t^2
$$

Eliminating $t$ shows that the path is a **parabola**:

$$
y = x\tan\theta - \frac{g x^2}{2 v_0^2 \cos^2\theta}
$$

From these follow, on level ground:

$$
T = \frac{2 v_0 \sin\theta}{g}, \qquad H = \frac{(v_0\sin\theta)^2}{2g}, \qquad R = \frac{v_0^2 \sin 2\theta}{g}
$$

for the flight time, the maximum height and the range. Since $\sin 2\theta$ is largest at $2\theta = 90°$, the **range is longest at 45°**. Angles that add up to 90°, such as 30° and 60°, give the same range: one flat and fast, one high and slow.

```bash
node motion.js projectile 30 45
```

```
launch at 30 m/s, 45°, g = 9.81 m/s²

                  range      max height   flight time   landing speed
no drag (exact)     91.7 m       22.9 m        4.32 s        30.0 m/s
```

Check: $30^2 \sin 90° / 9.81 = 91.7$ m.

## Adding air drag

In air, a moving ball feels a **drag** force against its motion. At the speeds of sports balls it grows with the square of the speed:

$$
F_D = \tfrac12 \rho C_d A v^2
$$

where $\rho \approx 1.2$ kg/m³ is the air density, $A$ the ball's cross-section, and $C_d$ the **drag coefficient**, which depends on the shape and surface (about 0.3–0.5 for a sphere, at these speeds). Dividing by the mass gives a deceleration $k v^2$, with $k = \rho C_d A / 2m$.

With drag, the horizontal and vertical motions are no longer independent (the drag depends on the total speed), and there is no formula for the path. The script solves the equations of motion numerically, in steps of half a millisecond (the final project explains how):

```bash
node motion.js projectile 40 45 --drag baseball
```

```
launch at 40 m/s, 45°, g = 9.81 m/s²

                  range      max height   flight time   landing speed
no drag (exact)    163.1 m       40.8 m        5.77 s        40.0 m/s
with drag           95.5 m       29.7 m        4.90 s        25.4 m/s

drag constant k = rho Cd A / 2m = 0.00623 per m; terminal speed sqrt(g/k) = 39.7 m/s
```

Air cuts the range of a hard-hit baseball by **more than 40 %**. The path is no longer a parabola: it comes down more steeply than it went up. And the best angle is no longer 45°:

```bash
node motion.js best-angle 40 --drag baseball
```

```
angle   range
  20°    74.3 m
  30°    90.5 m
  35°    94.6 m
  40°    96.2 m
  45°    95.5 m
  50°    92.5 m
  60°    80.1 m

longest range: 96.3 m at about 41°
```

With drag, flatter is better: a high trajectory spends longer in the air, losing more speed. (Real baseballs also spin, and the spin creates lift, the **Magnus effect**, which this model leaves out. It is why the best launch angles measured for home runs are lower still, around 25–35°.)

A football is lighter for its size, so drag affects it even more:

```bash
node motion.js projectile 30 30 --drag football
```

```
                  range      max height   flight time   landing speed
no drag (exact)     79.5 m       11.5 m        3.06 s        30.0 m/s
with drag           47.8 m        8.6 m        2.63 s        17.6 m/s
```

## Where the formulas still work

Without drag, the equations are exact. They are also a very good approximation for dense, slow objects over short distances: a thrown stone, a shot put (where drag changes the range by only a few percent), or water from a hose. The "terminal speed" in the output, $\sqrt{g/k}$, is a handy test: if the projectile's speed is much less than its terminal speed, you can ignore drag.

## Check yourself

1. At what two angles can you throw a ball at 20 m/s to land 30 m away, without drag?
2. A ball rolls off a 1.2 m high table at 3 m/s. Where does it land? (Hint: first find the time to fall 1.2 m.)
3. Run `node motion.js best-angle 25 --drag golf` and `node motion.js best-angle 70 --drag golf`. How does the best angle change with speed? Why?
