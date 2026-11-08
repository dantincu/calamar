# Magnetic forces

## Magnets and fields

A magnet has a north and a south pole; like poles repel, unlike attract. Unlike electric charges, poles always come in pairs: cut a magnet in half and you get two smaller magnets. No isolated magnetic pole (a "monopole") has ever been found.

The **magnetic field** $\vec B$ is measured in **teslas** (T). The Earth's field at the surface is about 25–65 µT; a fridge magnet about 5 mT; an MRI scanner 1.5–3 T, more than 30,000 times the Earth's field.

## The force on a moving charge

A charge $q$ moving with velocity $\vec v$ in a magnetic field feels the **Lorentz force**:

$$
\vec F = q\,\vec v \times \vec B, \qquad F = qvB\sin\theta
$$

where $\theta$ is the angle between $\vec v$ and $\vec B$. The cross product means the force is **perpendicular to both** the velocity and the field (use the right-hand rule: fingers along $\vec v$, curl them toward $\vec B$, the thumb gives the force on a positive charge). Two consequences:

- a charge at rest, or moving along the field, feels no magnetic force;
- because the force is always perpendicular to the motion, it does **no work**: it changes the direction of a charge, never its speed.

## Circular motion

A charge moving perpendicular to a uniform field therefore moves in a circle. The magnetic force provides the centripetal force:

$$
qvB = \frac{mv^2}{r} \quad\Rightarrow\quad r = \frac{mv}{qB}, \qquad f = \frac{qB}{2\pi m}
$$

```bash
node em.js particle electron 1e6 1e-3
node em.js particle proton 1e6 1
```

```
radius r = mv / (|q|B) = 5.686 mm
cyclotron frequency f = |q|B / (2 pi m) = 27.99 MHz (independent of the speed)
radius r = mv / (|q|B) = 10.44 mm
cyclotron frequency f = |q|B / (2 pi m) = 15.25 MHz (independent of the speed)
```

The frequency doesn't depend on the speed: faster particles move on bigger circles in the same time. Ernest Lawrence used this in 1931 to build the **cyclotron**: an alternating voltage, at exactly that frequency, kicks the particles each half-turn, and they spiral outward, gaining energy.

Other uses of the same formula:

- A **mass spectrometer** sends ions of the same speed through a field; heavier ions curve less, so they land in different places. It sorts isotopes and identifies molecules in labs.
- The Earth's field traps charged particles from the Sun and guides them toward the poles, where they make the air glow: the **aurora**.
- Particle detectors at CERN measure particles' momenta from the curvature of their tracks.

## The force on a current

A current is moving charge, so a wire carrying current $I$ in a field feels a force. For a straight length $L$ at angle $\theta$ to the field:

$$
F = BIL\sin\theta
$$

A 1 m wire carrying 10 A at right angles to a 0.5 T field feels 5 N.

## The electric motor

Put a loop of wire in a magnetic field and pass a current through it. The two sides parallel to the axis carry current in opposite directions, so they are pushed in opposite directions: a **torque**. For a coil of $N$ turns and area $A$:

$$
\tau = NBIA\sin\theta
$$

where $\theta$ is the angle between the field and the coil's axis. The torque would reverse after half a turn, so a DC motor uses a **commutator** (a split ring with brushes) to reverse the current every half turn and keep the coil spinning. Modern brushless motors (in drones, computer fans and electric cars) switch the current electronically instead.

Electric motors convert electrical energy to motion with efficiencies of 90 % or more, much better than combustion engines (typically 20–40 %), and they consume a large share of the world's electricity.

## Check yourself

1. An electron moves at $2 \times 10^7$ m/s perpendicular to the Earth's field (50 µT). What is the radius of its circle?
2. Why can't a magnetic field change the kinetic energy of a charged particle?
3. In a mass spectrometer, two isotopes with masses 12 u and 13 u enter a field with the same speed. What is the ratio of the radii of their paths?
