# Numerical integration: Euler, Verlet and Runge-Kutta

The projectile with drag, the large-amplitude pendulum and the damped spring of this course were all computed by `motion.js` without any formula for the answer. This project opens the box. You need `motion.js`.

## 1. The idea

Newton's second law gives the acceleration from the current position and velocity: $a = F(x, v)/m$. If we know the state now, we can estimate it a small time step $h$ later, and repeat. The simplest method, by Leonhard Euler (1768):

$$
x_{n+1} = x_n + h\, v_n, \qquad v_{n+1} = v_n + h\, a(x_n)
$$

It just assumes that velocity and acceleration stay constant during each step. They don't, so each step makes a small error, and the errors add up. The question is: how quickly, and in which direction?

## 2. A test problem with a known answer

A good test is a circular orbit. With units where $GM = 1$, start at radius 1 with speed 1: the exact solution stays on the circle forever, with period $2\pi$ and total energy $E = \frac12 v^2 - 1/r = -\frac12$. Any change in the radius or the energy is a numerical error.

The script runs four methods:

- **Euler**, as above;
- **semi-implicit Euler**: update the velocity first, then use the *new* velocity for the position (a one-line change);
- **velocity Verlet**: the position uses the current acceleration, the velocity the average of the old and new accelerations;
- **RK4**, the classic fourth-order Runge-Kutta method: it evaluates the acceleration at four points within the step and combines them, as a weighted average (used by the projectile and pendulum commands).

```bash
node motion.js integrators 0.05 10
```

```
circular orbit, GM = 1, r = 1: 10 orbits with time step 0.05 (1257 steps)

method                 radius at end   relative energy error   force evaluations
Euler                       3.08906         6.40e-1              1257
semi-implicit Euler         1.00135         1.81e-6              1257
velocity Verlet             1.00000        9.83e-12              1257
RK4                         1.00000        -5.46e-7              5028
```

After only ten orbits, **Euler's planet has spiraled out to three times its radius**: each step adds a little energy, and it never stops adding. The tiny change to semi-implicit Euler fixes most of it, for the same cost.

## 3. The long run

Now a coarser step, for a thousand orbits:

```bash
node motion.js integrators 0.1 1000
```

```
circular orbit, GM = 1, r = 1: 1000 orbits with time step 0.1 (62832 steps)

method                 radius at end   relative energy error   force evaluations
Euler                      61.51189         9.70e-1             62832
semi-implicit Euler         0.99031         1.00e-2             62832
velocity Verlet             1.00113         5.69e-6             62832
RK4                         0.99824        -1.76e-3            251328
```

RK4, much more accurate per step, has started to **drift**: its energy error grows steadily, and the orbit slowly decays. Verlet, which is "only" second order, keeps the energy right to a few parts per million, using a quarter of the force evaluations.

## 4. Why: symplectic methods

Verlet and semi-implicit Euler belong to a family of **symplectic** integrators. Without going into the mathematics: they are built so that they exactly conserve a quantity very close to the true energy. Their energy error oscillates but stays **bounded**, forever. Non-symplectic methods such as Euler and RK4 have errors that, however small, **accumulate** in one direction.

That is why:

- **molecular dynamics** codes, which simulate millions of atoms for billions of steps, use Verlet;
- **solar system** simulations over millions of years use symplectic methods;
- **game physics engines** mostly use semi-implicit Euler: it is cheap and stable enough;
- RK4 and its adaptive cousins (which change the step size as they go) dominate where accuracy over a limited time matters more than long-term conservation, or where there is friction anyway, as in the projectile with drag.

## 5. The order of a method

Halve the step and see how the error changes. For a method of **order** $p$, the error over a fixed time scales as $h^p$: halving the step divides it by $2^p$. Euler is first order, Verlet second, RK4 fourth.

```bash
node motion.js integrators 0.1 1
node motion.js integrators 0.05 1
node motion.js integrators 0.025 1
```

**Exercise 1.** Run these three commands and record each method's energy error after one orbit. By what factor does each error shrink when you halve the step? You should find that RK4's error falls by a factor of about 30 each time, while Euler's falls by only about 1.5: its errors are so large at these steps that it hasn't yet reached the factor of 2 its order predicts. (The circular orbit is a very symmetric problem, so the energy errors of Verlet and RK4 here are smaller, and fall faster, than on a typical problem.) Which method gives a 0.1 % accurate energy with the fewest force evaluations?

**Exercise 2.** Find the largest time step for which Euler keeps the radius within 1 % of 1 after a single orbit. How many steps per orbit is that? How does it compare with what Verlet needs?

**Exercise 3.** In `motion.js`, the `fly` function simulates the projectile with RK4 and $h = 0.0005$ s. Change $h$ to 0.01 and 0.05 and rerun `node motion.js projectile 40 45 --drag baseball`. How much does the range change? What step would be "good enough" for a game, and for a physics exam?

**Exercise 4.** Add a fifth method to the `integrators` command: **explicit midpoint** (take a half Euler step, compute the acceleration there, and use it for the full step). Is it symplectic? Test it on 1,000 orbits.

## What this shows

The laws of mechanics fit on a postcard, but solving them for real systems takes computation, and computation has its own physics. A good method respects the structure of the problem (here, conservation of energy) as well as being accurate step by step. This is why astronomers can predict eclipses centuries ahead, and why a badly written game sends objects flying off into space.

Congratulations on finishing the course.
