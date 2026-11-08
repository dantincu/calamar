# Welcome to the course

Classical mechanics is the physics of motion: how things move, and why. With a handful of laws, written down by Galileo, Newton and their successors between 1600 and 1800, it predicts the flight of a ball, the swing of a pendulum, the orbit of a satellite and the return of a comet decades in advance. It is still what engineers use to design bridges, cars and rockets.

## What you will learn

1. **Describing motion**: vectors, velocity and acceleration, the equations of uniform acceleration, and projectiles, with and without air drag.
2. **Forces**: Newton's three laws, free-body diagrams, friction, inclined planes, drag, terminal speed and circular motion.
3. **Energy and momentum**: work, kinetic and potential energy, power, conservation laws, collisions and the rocket equation.
4. **Rotation**: torque, moment of inertia, angular momentum and rolling.
5. **Gravitation**: Newton's law, Kepler's laws, orbits, escape speed and orbital transfers.
6. **Oscillations**: springs, pendulums, damping and resonance.
7. **Project**: how simulations work, and why some methods conserve energy and others don't.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages):

```bash
node motion.js projectile 40 45 --drag baseball    # a thrown baseball, with and without air
node motion.js pendulum 1 30                        # the exact period of a pendulum
node collide.js 1000 20 1500 -10 0.1                # two cars colliding head-on
node gravity.js orbit 400                           # the orbit of the International Space Station
node motion.js integrators 0.1 1000                 # four ways to simulate an orbit
```

Every output in the pages comes from running them. Change the numbers: predicting what will happen before you press Enter is the best exercise in physics.

## What you need

High-school algebra and trigonometry (sine, cosine, Pythagoras). The course uses a little calculus notation, $v = dx/dt$ meaning "the rate of change of $x$", and explains it where it appears. Values use SI units: meters, kilograms, seconds, and $g = 9.81$ m/s² for the acceleration of gravity at the Earth's surface.
