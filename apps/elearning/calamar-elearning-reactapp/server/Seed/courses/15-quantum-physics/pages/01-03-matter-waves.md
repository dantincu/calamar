# Matter waves

## De Broglie's hypothesis

If light waves behave like particles, maybe particles behave like waves. In his 1924 doctoral thesis, Louis de Broglie proposed that every particle with momentum $p$ has a wavelength:

$$
\lambda = \frac{h}{p} = \frac{h}{mv}
$$

the same relation as for photons. For an electron accelerated through a voltage $V$, $p = \sqrt{2meV}$:

```bash
node quantum.js debroglie electron 100
node quantum.js debroglie 0.145 40
```

```
electron accelerated through 100 V: speed 5931 km/s
de Broglie wavelength lambda = h / p = 1.226e-10 m = 0.1226 nm
mass 0.145 kg at 40 m/s
de Broglie wavelength lambda = h / p = 1.142e-34 m
```

A 100 eV electron has a wavelength of 0.12 nm, about the spacing of atoms in a crystal. A baseball's is $10^{-34}$ m, a billion billion times smaller than a proton: far too small ever to notice. That is why we don't see quantum effects in everyday life: they are there, but invisible at large scales.

## Electron diffraction

The prediction was tested in 1927. Clinton Davisson and Lester Germer fired electrons at a nickel crystal and found that they bounced off strongly only at certain angles, exactly as X-rays do, with the wavelength de Broglie predicted. George Paget Thomson passed electrons through thin metal films and saw diffraction rings. (Thomson's father, J. J. Thomson, had won the Nobel Prize for showing that the electron is a particle; the son won it for showing it is a wave.)

Since then, interference has been seen with neutrons, atoms, and molecules of 2,000 atoms. **Electron microscopes** exploit the short wavelength: resolution is limited by wavelength, so electrons with wavelengths thousands of times shorter than visible light can image individual atoms.

## The double-slit experiment

The clearest demonstration is the **double slit**. Fire electrons, one at a time, at a barrier with two narrow slits, and record where each one lands on a screen behind it.

- Each electron arrives at **one point**, like a particle.
- After many electrons, the points build up an **interference pattern** of bright and dark bands, like a wave passing through both slits. (This was filmed electron by electron by Akira Tonomura's team at Hitachi in 1989.)
- The bands are spaced as for a wave of wavelength $h/p$: on a screen at distance $L$ from slits a distance $d$ apart, the bright bands are separated by about $\lambda L / d$.

There are places on the screen where electrons almost never land, though they would with either slit open alone. Opening a second slit *reduces* the arrivals there. Something passes through both slits and interferes with itself.

And if you place a detector to find out which slit each electron goes through, **the pattern disappears**: you get two plain bands, as for particles. Any measurement that could, even in principle, tell the paths apart destroys the interference.

Feynman called the double slit "a phenomenon which is impossible, absolutely impossible, to explain in any classical way, and which has in it the heart of quantum mechanics". The next chapter introduces the mathematics that describes it: the **wave function**, whose waves interfere, and whose squared size gives the probability of where the particle is found.

## Wave-particle duality

Light and matter are neither classical waves nor classical particles. They propagate like waves (they interfere and diffract) and they are detected like particles (one at a time, at one place). Which aspect appears depends on the experiment. The relations

$$
E = hf, \qquad p = \frac{h}{\lambda}
$$

link the particle properties (energy, momentum) to the wave properties (frequency, wavelength), for photons and electrons alike.

## Check yourself

1. What is the de Broglie wavelength of a neutron with a speed of 2,200 m/s ("thermal" neutrons, used to study crystals)? Use $m_n = 1.675 \times 10^{-27}$ kg, or `node quantum.js debroglie 1.675e-27 2200`.
2. Electrons of what energy have a wavelength of 0.05 nm?
3. In a double-slit experiment with electrons of wavelength 0.05 nm, slits 1 µm apart and a screen 1 m away, how far apart are the bright bands?
