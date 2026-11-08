# Torque, inertia and angular momentum

Rotation has its own versions of the quantities of straight-line motion. Learning the correspondence is most of the work:

| Straight line | Rotation |
|---|---|
| position $x$ (m) | angle $\theta$ (rad) |
| velocity $v$ (m/s) | angular velocity $\omega$ (rad/s) |
| acceleration $a$ (m/s²) | angular acceleration $\alpha$ (rad/s²) |
| mass $m$ (kg) | moment of inertia $I$ (kg·m²) |
| force $F$ (N) | torque $\tau$ (N·m) |
| $F = ma$ | $\tau = I\alpha$ |
| momentum $p = mv$ | angular momentum $L = I\omega$ |
| kinetic energy $\frac12 mv^2$ | rotational kinetic energy $\frac12 I\omega^2$ |

A point at distance $r$ from the axis moves at $v = \omega r$. One revolution is $2\pi$ radians: a wheel at 600 rpm turns at $600 \times 2\pi / 60 = 62.8$ rad/s.

## Torque

A force turns an object more if it is applied farther from the axis, and at right angles to the lever. The **torque** is:

$$
\tau = r F \sin\theta
$$

where $r$ is the distance from the axis and $\theta$ the angle between the lever and the force. That is why door handles are far from the hinges, and why a long spanner loosens a stuck bolt: doubling the length doubles the torque.

**Balance.** An object is in equilibrium when both the net force and the net torque are zero. On a see-saw, a 30 kg child 2 m from the pivot balances a 60 kg adult 1 m from it: $30g \times 2 = 60g \times 1$. The same rule, applied to the bones and muscles of your arm, shows that your biceps (attached about 4 cm from the elbow) must pull with about eight times the weight of something held in your hand 33 cm from the elbow.

## Moment of inertia

The rotational inertia of an object depends on its mass and on **how far that mass is from the axis**:

$$
I = \sum m_i r_i^2
$$

| Object (axis through the center) | $I$ |
|---|---|
| thin ring or hollow cylinder | $MR^2$ |
| solid disk or cylinder | $\frac12 MR^2$ |
| solid sphere | $\frac25 MR^2$ |
| hollow sphere | $\frac23 MR^2$ |
| thin rod (axis at the center, across it) | $\frac{1}{12} ML^2$ |

A ring has all its mass at the rim, so it has the largest inertia for its mass and radius. Flywheels store energy as $\frac12 I\omega^2$, and are built with heavy rims for this reason.

## Rolling

A rolling wheel both moves and turns. Without slipping, its center moves at $v = \omega R$, and its kinetic energy has two parts:

$$
K = \tfrac12 M v^2 + \tfrac12 I\omega^2 = \tfrac12\left(M + \frac{I}{R^2}\right)v^2
$$

**The race down the slope.** Release a solid ball, a solid cylinder and a hoop from the same height $h$. Energy conservation, $Mgh = \frac12(M + I/R^2)v^2$, with $I = cMR^2$:

$$
v = \sqrt{\frac{2gh}{1 + c}}
$$

The mass and radius cancel! Only the shape, $c$, matters. The ball ($c = 2/5$) wins, then the cylinder ($c = 1/2$), then the hoop ($c = 1$), whatever their sizes and materials. Objects with more of their mass far from the axis put more energy into spinning, and less into moving. A block sliding without friction ($c = 0$) would beat them all.

## Angular momentum

The **angular momentum** of a rotating object is $L = I\omega$, and like linear momentum, it is **conserved** when no external torque acts:

$$
I_1\omega_1 = I_2\omega_2
$$

- A **figure skater** spinning with arms outstretched pulls them in. Her moment of inertia falls, perhaps to a third, so her spin speeds up threefold.
- A **diver** tucks to spin fast, and stretches out to slow the rotation before entering the water.
- A **collapsing star** spins up enormously: a star with the Sun's rotation, shrunk to a 10 km neutron star, would spin many times per second. Pulsars do.

Angular momentum is a vector along the axis, and conserving it keeps the axis fixed in direction: that is why a spinning top stays up, a thrown frisbee is stable, a bicycle is easier to balance at speed, and the Earth's axis points toward the same place in the sky (near the Pole Star) year after year.

## Check yourself

1. You push a door with 20 N at the handle, 0.8 m from the hinges, at right angles. What torque? What if you push at 45°?
2. A solid ball rolls down a ramp from a height of 1 m. How fast is it going at the bottom? Compare with a block sliding without friction.
3. A skater spins at 2 revolutions per second with $I = 4$ kg·m². She pulls her arms in and $I$ falls to 1.6 kg·m². How fast does she spin now? Has her kinetic energy changed? Where did any extra energy come from?
