# Tunneling

## Through the wall

A ball rolling toward a hill without enough energy to climb it bounces back, always. A quantum particle doesn't, always. Its wave function decays inside the barrier, but if the barrier is thin, some of the wave is still there on the other side, and the particle can be found there: it has **tunneled** through.

Inside a barrier of height $V_0$, a particle of energy $E < V_0$ has a wave function that decays as $e^{-\kappa x}$, with:

$$
\kappa = \frac{\sqrt{2m(V_0 - E)}}{\hbar}
$$

The probability of getting through a barrier of width $a$ is roughly:

$$
T \approx e^{-2\kappa a}
$$

more precisely, for a rectangular barrier:

$$
T = \left[1 + \frac{V_0^2 \sinh^2(\kappa a)}{4E(V_0 - E)}\right]^{-1}
$$

```bash
node quantum.js tunnel 1 2 0.5
```

```
decay constant kappa = sqrt(2m(V0 - E)) / hbar = 5.123 per nm (the wave falls by 1/e every 0.195 nm)
exact transmission T = 2.355e-2; rough estimate e^(-2 kappa a) = 5.957e-3

width (nm)   transmission
     0.1     7.775e-1
     0.2     4.044e-1
     0.5     2.355e-2
     1.0     1.419e-4
     2.0     5.037e-9
```

An electron with 1 eV hitting a 2 eV barrier half a nanometer thick gets through 2.4 % of the time. (The rough estimate misses a prefactor, here $16E(V_0 - E)/V_0^2 = 4$, but has the right exponential behavior.) The transmission falls **exponentially** with width: each extra nanometer cuts it by a factor of about 30,000. Tunneling matters only at atomic scales, and there it matters enormously.

## Where tunneling happens

**Radioactive alpha decay.** An alpha particle (two protons, two neutrons) inside a nucleus is held by the strong force, behind a barrier formed by the electric repulsion. George Gamow explained in 1928 that it escapes by tunneling. Because of the exponential, small differences in energy give enormous differences in rate: half-lives of alpha emitters range from less than a microsecond to billions of years.

**The Sun.** Two protons must get close enough to fuse, against their electric repulsion. At the Sun's core temperature (15 million K), classically, almost none have enough energy. They fuse anyway, by tunneling, slowly enough that the Sun burns for 10 billion years.

**The scanning tunneling microscope.** A sharp metal tip held a fraction of a nanometer above a surface, with a small voltage: electrons tunnel across the gap. Because the current changes about tenfold for every 0.1 nm of distance, scanning the tip and keeping the current constant maps the surface with atomic resolution. Gerd Binnig and Heinrich Rohrer invented it in 1981 (Nobel Prize 1986).

**Electronics.** Flash memory (USB sticks, SSDs, phones) stores bits as charge on an isolated "floating gate", written and erased by pushing electrons through a thin insulating layer by tunneling. And as transistors shrink toward a few nanometers, unwanted tunneling through their gate insulators is one of the main limits on making them smaller.

## Tunneling between two wells

Two wells side by side, separated by a thin wall: an electron in one can tunnel to the other. The Schrödinger equation shows what really happens. Instead of one level per well, there are two levels, slightly split:

```bash
node schrodinger.js double 0.6 0.5 0.5 --levels 2
```

```
double well: two wells of 0.6 nm, a 0.5 nm wall between them, depth 0.5 eV
grid: 4000 points, spacing 0.72 pm

level   energy (eV)
  n = 1      0.22386
  n = 2      0.31305

splitting of the two lowest levels: 89.18 meV; an electron put in one well tunnels to the other and back with period h / dE = 46.4 fs
```

(The plots, left out here, show both states spread over the two wells: the lower one with the same sign in both, the upper one with opposite signs.) An electron started in one well is a superposition of the two states, and their different energies make it slosh back and forth between the wells. A thicker wall gives a smaller splitting and slower tunneling:

```bash
node schrodinger.js double 0.6 1.0 0.5 --levels 2 --plot 0
```

```
splitting of the two lowest levels: 24.77 meV; an electron put in one well tunnels to the other and back with period h / dE = 167.0 fs
```

The same physics splits the energy levels of the ammonia molecule, whose nitrogen atom tunnels through the plane of the three hydrogens: the 24 GHz microwave transition it produces drove the first maser (1954), the forerunner of the laser. And it is how the electrons of two neighboring atoms form a chemical bond.

## Check yourself

1. Using `node quantum.js tunnel`, how does the transmission through a 0.5 nm, 2 eV barrier change if the electron's energy rises from 1 eV to 1.5 eV?
2. A proton is about 1,836 times heavier than an electron. How does that change $\kappa$, and so tunneling? Why do protons tunnel much less than electrons?
3. Why does the STM's current depend so sensitively on the distance between the tip and the surface?
