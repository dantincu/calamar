# Bound states: wells and oscillators

## The particle in a box

The simplest bound system: a particle trapped between two infinitely high walls, a distance $L$ apart. Inside, $V = 0$; the wave function must vanish at the walls, like a string fixed at both ends. So a whole number of half-wavelengths must fit:

$$
\psi_n(x) = \sqrt{\frac{2}{L}}\sin\frac{n\pi x}{L}, \qquad \lambda_n = \frac{2L}{n}, \qquad E_n = \frac{p^2}{2m} = \frac{n^2\pi^2\hbar^2}{2mL^2}
$$

```bash
node quantum.js box 1
```

```
electron in an infinite well of width 1 nm: E_n = n² pi² hbar² / (2 m L²) = n² x 0.3760 eV

  n = 1: 0.376 eV
  n = 2: 1.504 eV
  n = 3: 3.384 eV
  n = 4: 6.016 eV
  n = 5: 9.401 eV

photon for the jump 2 -> 1: 1.128 eV, wavelength 1099 nm
```

Three things to notice:

- the lowest energy is **not zero**: a confined particle can never be at rest. This **zero-point energy** is a direct consequence of the uncertainty principle (page 4 of this chapter);
- the levels grow as $n^2$, and they spread apart as the box shrinks, as $1/L^2$;
- for an electron in a box of atomic size, the energies are electronvolts, the energies of chemistry and of visible light.

**Quantum dots** are exactly this: semiconductor crystals a few nanometers across. Their color is set by their **size**, through $1/L^2$: smaller dots emit bluer light. They are used in some TV screens, and their discovery won the 2023 Nobel Prize in Chemistry.

## Solving the equation numerically

Most potentials have no formula for their levels. `schrodinger.js` solves the time-independent equation on a grid of 4,000 points: the second derivative becomes a difference between neighboring points, the equation becomes a matrix eigenvalue problem, and the script finds the lowest eigenvalues (by bisection) and their wave functions. Check it first on the box, where we know the answer:

```bash
node schrodinger.js box 1 --plot 0
```

```
infinite well of width 1 nm; exact E_n = n² pi² hbar²/(2 m L²)
grid: 4000 points, spacing 0.25 pm

level   energy (eV)   exact (eV)
  n = 1      0.37603      0.37603
  n = 2      1.50412      1.50412
  n = 3      3.38427      3.38427
  n = 4      6.01647      6.01648
```

Agreement to five digits.

## The harmonic oscillator

A particle in a parabolic potential, $V = \frac12 m\omega^2 x^2$, models any system near a stable equilibrium: atoms vibrating in a molecule, or in a crystal. Its levels are exactly evenly spaced:

$$
E_n = \left(n + \tfrac12\right)\hbar\omega
$$

```bash
node schrodinger.js harmonic 0.1 --plot 0
```

```
harmonic oscillator, hbar omega = 0.1 eV; exact E_n = (n + ½) hbar omega
grid: 4000 points, spacing 1.85 pm

level   energy (eV)   exact (eV)
  n = 1      0.05000      0.05000
  n = 2      0.15000      0.15000
  n = 3      0.25000      0.25000
  n = 4      0.35004      0.35000
```

(The script numbers the levels from 1; the formula from $n = 0$.) Evenly spaced levels mean that a vibrating molecule absorbs and emits infrared light at one frequency, $\omega$: that is how CO₂ and water vapor absorb the Earth's infrared radiation, the greenhouse effect. The ground state again has zero-point energy, $\frac12\hbar\omega$: molecules vibrate even at absolute zero.

## The finite well

A real well has walls of finite height $V_0$. Inside, $\psi$ oscillates; outside, it decays exponentially. Here is an electron in a well 1 nm wide and 0.5 eV deep:

```bash
node schrodinger.js finite 1 0.5
```

```
finite well: width 1 nm, depth 0.5 eV (levels above 0.5 eV are not bound)
grid: 4000 points, spacing 2.00 pm

level   energy (eV)
  n = 1      0.14987
  n = 2      0.48005
  n = 3: none (no more bound states below 0.5 eV)

|psi|² of level 1 (x from 0 to 8.00 nm)
  |                               ##                               
  |                              ####                              
  |                             ######                             
  |                            ########                            
  |                          ############                          
  +----------------------------------------------------------------
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^   (^ = classically forbidden)
```

(The plots of level 2 are left out here.) Compare with the infinite well of the same width: the levels are **lower** (0.150 instead of 0.376 eV), because the wave can spread into the walls, which makes its wavelength longer. Only **two** bound states fit: a finite well always holds a finite number. And the plot shows probability in the regions marked `^`, where the particle's energy is below the wall: **the electron is found inside the walls**, where classically it could never be. That leakage is the subject of the next page.

(The exact levels, from the transcendental equations of the finite well, are 0.14983 and 0.47963 eV. The small differences come from the grid and from the hard walls at the edges of the simulated region.)

## Check yourself

1. By what factor do the box energies change if the box is made three times wider?
2. Run `node schrodinger.js finite 2 0.5`. How many bound states are there now? Why more?
3. Run `node schrodinger.js harmonic 0.1` with the plots on. Count the nodes (zeros) of $|\psi|^2$ for each level. What is the pattern?
