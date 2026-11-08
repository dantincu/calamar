# Light comes in quanta

## The blackbody problem

Heat a piece of iron and it glows dull red, then orange, then white. Every object emits light, mostly infrared at room temperature, with a spectrum that depends only on its temperature, for an ideal absorber (a **blackbody**). The peak wavelength follows **Wien's law**, and the total power the **Stefan-Boltzmann law**:

$$
\lambda_{\max} = \frac{b}{T}, \quad b = 2.898 \times 10^{-3}\ \text{m K}, \qquad P = \sigma T^4 \ \text{per m}^2
$$

```bash
node quantum.js blackbody 5772
```

```
Wien's law: peak wavelength = b / T = 2.898e-3 / 5772 = 502 nm
Stefan-Boltzmann: power radiated per m² = sigma T^4 = 6.294e+7 W/m²

wavelength   relative intensity
     126 nm   0.000
     251 nm   0.222  #########
     377 nm   0.801  ################################
     502 nm   1.000  ########################################
     753 nm   0.710  ############################
    1004 nm   0.405  ################
    1506 nm   0.138  ######
    2510 nm   0.027  #
```

The Sun's surface (5,772 K) peaks in the blue-green; your body (310 K) peaks near 9.3 µm, in the infrared, which is what thermal cameras see.

Classical physics predicted a disaster. Treating light in a hot cavity as waves, each with an average energy $k_B T$, it gave an intensity that grows without limit at short wavelengths: an infinite amount of ultraviolet light from any warm object, later called the **ultraviolet catastrophe**. The real spectrum falls to zero.

In 1900, Max Planck found a formula that fit the measurements perfectly, by assuming that the oscillators emitting the light could only have energies in whole multiples of a small unit:

$$
E = hf, \qquad h = 6.626 \times 10^{-34}\ \text{J s}
$$

where $f$ is the frequency and $h$ is now called **Planck's constant**. At high frequencies the energy steps are too big for the thermal motion to supply, so short wavelengths are suppressed. The script uses Planck's formula. Planck saw his assumption as a mathematical trick; it was the beginning of quantum physics.

## The photoelectric effect

Shine light on a clean metal and it can knock out electrons. The experiments (Philipp Lenard, around 1902) contradicted the wave theory of light:

- below a **threshold frequency**, no electrons come out, however bright the light;
- above it, electrons come out **immediately**, even in very dim light;
- the electrons' maximum energy depends on the **frequency**, not on the brightness. Brighter light gives *more* electrons, not faster ones.

In 1905, Albert Einstein explained it: light itself consists of packets, **photons**, each with energy $hf$. One photon gives all its energy to one electron, which spends part of it, the metal's **work function** $W$, to escape:

$$
K_{\max} = hf - W
$$

```bash
node quantum.js photoelectric 400 2.28
node quantum.js photoelectric 600 2.28
```

```
photon energy hc/lambda = 1239.8 / 400 = 3.100 eV; work function 2.28 eV
maximum electron kinetic energy = hf - W = 0.820 eV; stopping voltage 0.820 V; electron speed 537 km/s
photon energy hc/lambda = 1239.8 / 600 = 2.066 eV; work function 2.28 eV
no electrons: the photon energy is below the work function (threshold wavelength 544 nm), however bright the light
```

A handy form: with $E$ in eV and $\lambda$ in nm, $E = 1239.8 / \lambda$. Violet light (400 nm) frees electrons from sodium; orange light (600 nm) can't, at any intensity. Robert Millikan, who set out to disprove Einstein's equation, confirmed it precisely in 1916. Einstein's Nobel Prize (1921) was for this work, not for relativity.

## Photons

A photon has energy and momentum, but no mass:

$$
E = hf = \frac{hc}{\lambda}, \qquad p = \frac{h}{\lambda}
$$

```bash
node quantum.js photon 550
```

```
f = c / lambda = 5.4508e+14 Hz; E = hf = 3.6117e-19 J = 2.254 eV; p = h / lambda = 1.2047e-27 kg m/s
```

A green photon carries $3.6 \times 10^{-19}$ J. A 1 mW green laser pointer emits $10^{-3} / 3.6 \times 10^{-19} \approx 3 \times 10^{15}$ photons per second, so many that light looks continuous. Arthur Compton showed in 1923 that X-ray photons bounce off electrons like billiard balls, exchanging momentum as $p = h/\lambda$ predicts: the **Compton effect**.

Photons are why ultraviolet light causes sunburn and red light doesn't (each UV photon has enough energy to damage a DNA molecule), and why digital cameras, solar cells and your retina work: they all count photons, one electron per photon.

But light also shows interference and diffraction, which only waves do. So is light a wave or a particle? Quantum physics answers: neither, exactly. The next pages show that matter has the same double nature.

## Check yourself

1. What is the peak wavelength of a star at 3,000 K? At 10,000 K? What colors would they look?
2. The work function of zinc is 4.3 eV. What is its threshold wavelength? Will visible light free electrons from zinc?
3. How many photons per second does a 5 W red LED (630 nm) emit, if all its power became light?
