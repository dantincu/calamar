# Springs, pendulums and resonance

## Simple harmonic motion

A mass $m$ on a spring of stiffness $k$ feels a force pulling it back toward equilibrium, proportional to its displacement $x$ (Hooke's law):

$$
F = -kx \quad\Rightarrow\quad m\frac{d^2x}{dt^2} = -kx
$$

The solution is a sine wave, **simple harmonic motion**:

$$
x(t) = A\cos(\omega t + \varphi), \qquad \omega = \sqrt{\frac{k}{m}}, \qquad T = 2\pi\sqrt{\frac{m}{k}}
$$

where $A$ is the amplitude and $\varphi$ the phase. Two remarkable facts:

- the period **doesn't depend on the amplitude**: big swings and small swings take the same time;
- a stiffer spring makes it faster; a heavier mass, slower.

Energy sloshes between kinetic and elastic potential energy, with a constant total $E = \frac12 kA^2$: at the ends, all potential; in the middle, all kinetic.

Simple harmonic motion appears everywhere, because **any** smooth potential energy curve looks like a parabola near its minimum. Atoms in molecules, a boat bobbing, the air in a flute: for small oscillations, they all obey the same equation.

## The pendulum

A pendulum of length $L$ feels a restoring force $-mg\sin\theta$. For small angles, $\sin\theta \approx \theta$ (in radians), the equation becomes that of simple harmonic motion, and:

$$
T_0 = 2\pi\sqrt{\frac{L}{g}}
$$

The mass cancels again, and the period depends only on the length and on $g$: Galileo's discovery, the basis of pendulum clocks from 1656 (Christiaan Huygens) until the quartz era. A 1 m pendulum has a period of about 2 s. Measuring $T$ for a known $L$ is a simple way to measure $g$.

But for large swings, $\sin\theta$ is less than $\theta$, the restoring force is weaker, and the period grows. The exact period has no elementary formula, but it can be computed with the **arithmetic-geometric mean**:

$$
T = \frac{T_0}{\text{AGM}\left(1, \cos\frac{\theta_0}{2}\right)}
$$

where $\text{AGM}(a, b)$ is found by replacing $a$ and $b$ by their arithmetic and geometric means, $\frac{a+b}{2}$ and $\sqrt{ab}$, until they agree (a few steps).

```bash
node motion.js pendulum 1 30
```

```
L = 1 m: small-angle period T0 = 2 pi sqrt(L/g) = 2.0061 s

amplitude   exact period   longer than T0 by
     5°       2.0070 s       0.05 %
    10°       2.0099 s       0.19 %
    20°       2.0215 s       0.77 %
    30°       2.0410 s       1.74 %
    45°       2.0863 s       4.00 %
    60°       2.1529 s       7.32 %
    90°       2.3678 s      18.03 %
   120°       2.7541 s      37.29 %
   170°       4.8935 s     143.94 %

simulated at 30°: period 2.0410 s
```

The script also simulates the full, non-linear equation and measures the period: it agrees with the formula to four decimals. A clock pendulum swinging at a few degrees has a period within 0.1 % of $T_0$; one swinging nearly upside down takes much longer, because it lingers near the top.

## Damping

Real oscillations die out, because friction and drag remove energy. With a drag force proportional to the velocity, $-bv$:

$$
m\ddot x = -kx - b\dot x
$$

(physicists write $\dot x$ for $dx/dt$, and $\ddot x$ for the second derivative). The behavior depends on the **damping ratio** $\zeta = b / (2\sqrt{mk})$:

- $\zeta < 1$, **underdamped**: oscillates, with an amplitude that decays as $e^{-bt/2m}$;
- $\zeta = 1$, **critically damped**: returns to equilibrium as fast as possible without overshooting (the goal for car suspensions and door closers);
- $\zeta > 1$, **overdamped**: creeps back slowly.

```bash
node motion.js spring 0.5 20 0.1 0.4
```

```
m = 0.5 kg, k = 20 N/m, b = 0.4 kg/s
natural frequency w0 = sqrt(k/m) = 6.325 rad/s, period 0.993 s; damping ratio zeta = 0.063 (underdamped)

    t (s)    x (m)    energy (J)
    0.000   0.1000     0.10000
    0.993   0.0671     0.04510
    1.987   0.0451     0.02034
    2.980   0.0303     0.00917
    3.974   0.0203     0.00414
    4.967   0.0136     0.00187
    5.961   0.0091     0.00084
    6.954   0.0061     0.00038
    7.948   0.0041     0.00017

amplitude decays as e^(-b t / 2m): halves every 1.73 s; quality factor Q = 1/(2 zeta) = 7.9
```

Each period the amplitude shrinks by the same factor (0.67), and the energy, which goes with the amplitude squared, by 0.45. The **quality factor** $Q$ roughly counts how many oscillations happen before the energy has mostly gone. A car suspension has $Q$ below 1; a guitar string around a thousand; a quartz watch crystal around 10,000 or more.

## Resonance

Push an oscillator periodically, and its response depends on how your frequency compares with its natural frequency $\omega_0 = \sqrt{k/m}$. Push at the natural frequency and every push adds to the motion: the amplitude builds up until damping limits it, at about $Q$ times the response to a slow push. That is **resonance**.

- Pushing a child on a swing works only in time with the swing.
- A singer can break a wine glass by holding its resonant note.
- Radios tune to one station by making a circuit resonate at its frequency (see *Electricity and Magnetism*).
- Engineers must keep the natural frequencies of bridges and buildings away from those of wind gusts, footsteps and earthquakes. London's Millennium Bridge swayed alarmingly on its opening day in 2000, when pedestrians fell into step with its sideways oscillation, and had to be fitted with dampers.

## Check yourself

1. A 2 kg mass on a spring oscillates with a period of 0.5 s. What is $k$?
2. What length of pendulum has a period of exactly 1 s? (A "seconds pendulum" in the old sense, with a 2 s period, is just under 1 m.)
3. Run `node motion.js spring 0.5 20 0.1 6.32`. What is the damping ratio? Describe the motion.
