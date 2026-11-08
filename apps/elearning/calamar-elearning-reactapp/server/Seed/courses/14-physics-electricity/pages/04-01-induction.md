# Faraday's law, generators and transformers

## Magnetic flux

The **magnetic flux** through a loop measures how much field passes through it:

$$
\Phi = BA\cos\theta
$$

where $A$ is the loop's area and $\theta$ the angle between the field and the loop's axis. It is measured in webers (1 Wb = 1 T·m²).

## Faraday's law

Michael Faraday found in 1831 that a **changing** flux through a loop creates a voltage in it, an **induced EMF**, and so a current if the loop is closed. For a coil of $N$ turns:

$$
\mathcal{E} = -N\frac{d\Phi}{dt}
$$

The flux can change in any way: move a magnet in or out of a coil, rotate the coil, change the current in a nearby coil. A steady field, however strong, induces nothing. Faraday's law is another of Maxwell's equations.

## Lenz's law

The minus sign has a meaning (Heinrich Lenz, 1834): **the induced current opposes the change that caused it**. Push a magnet's north pole into a coil, and the induced current makes the coil's near end a north pole, which repels the magnet. You must do work to push it in, and that work becomes the electrical energy. Otherwise you would get energy for free.

A striking demonstration: drop a strong magnet down a copper tube. It falls slowly, as if through honey. Its moving field induces circulating **eddy currents** in the copper, whose fields brake it. Trains and roller coasters use eddy-current brakes, with no contact and no wear.

## Generators

Rotate a coil of $N$ turns and area $A$ at angular speed $\omega$ in a field $B$. The flux $NBA\cos\omega t$ changes continuously, so:

$$
\mathcal{E}(t) = NBA\omega \sin\omega t
$$

an **alternating** voltage with a peak of $NBA\omega$:

```bash
node em.js generator 200 0.01 0.5 50
```

```
peak EMF = N B A omega = 200 x 0.5 x 0.01 x 2 pi 50 = 314.2 V, RMS = peak / sqrt 2 = 222.1 V
```

(The RMS value is explained in the next chapter.) Almost all the world's electricity is made this way, whether the turbine is turned by steam (from coal, gas or nuclear fission), water, or wind. Only solar cells and batteries make electricity without induction.

## Inductors

A coil opposes changes in its **own** current: when the current changes, so does its own flux, inducing an EMF that resists the change. This **self-inductance** $L$, in henries (H), gives:

$$
\mathcal{E} = -L\frac{dI}{dt}
$$

Connect an inductor and a resistor to a battery, and the current builds up exponentially, with time constant $\tau = L/R$:

```bash
node em.js rl 10 0.5 12
```

```
time constant tau = L/R = 50.00 ms, final current V/R = 1.200 A

  t =       0 s: I = 0 A
  t =  50.00 ms: I = 758.5 mA
  t =  100.0 ms: I = 1.038 A
  t =  150.0 ms: I = 1.140 A
  t =  250.0 ms: I = 1.192 A

energy stored in the magnetic field at the end: ½LI² = 360.0 mJ
```

An inductor stores energy $\frac12 LI^2$ in its magnetic field, as a capacitor stores $\frac12 CV^2$ in its electric field. Break the circuit suddenly and the current must collapse in microseconds; $dI/dt$ is huge, and so is the induced voltage. That is how a car's ignition coil turns 12 V into the tens of thousands of volts that fire a spark plug, and why switches for inductive loads need protection against sparks.

## Transformers

Two coils on one iron core: an alternating current in the **primary** makes an alternating flux, which induces a voltage in the **secondary**. Both coils see the same flux change per turn, so the voltages are in the ratio of the turns:

$$
\frac{V_s}{V_p} = \frac{N_s}{N_p}, \qquad V_p I_p \approx V_s I_s
$$

The second relation is energy conservation: good transformers are 98–99 % efficient. A step-up transformer raises the voltage and lowers the current by the same factor.

That makes the **power grid** possible. Generators produce perhaps 10–25 kV; transformers step it up to hundreds of kilovolts for long-distance lines (cutting the $I^2R$ losses, as the current page showed), then down in stages to 230 V for homes. It is also why the grid uses alternating current: transformers need a *changing* flux, so they don't work on DC. (Since the 1950s, power electronics also allow high-voltage DC lines, now used for very long cables and undersea links.)

## Check yourself

1. A 500-turn coil's flux changes from 0 to 2 mWb in 0.1 s. What is the average induced EMF?
2. A phone charger's transformer turns 230 V into 5 V. If the primary has 2,300 turns, how many does the secondary have? (Modern chargers use high-frequency switching electronics with much smaller transformers, but the principle is the same.)
3. Why does a transformer not work with a steady direct current?
