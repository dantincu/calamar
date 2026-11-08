# Maxwell's equations and light

## The missing piece

By the 1860s, the laws of electricity and magnetism were known, but James Clerk Maxwell noticed that Ampère's law was inconsistent when currents change. Charging a capacitor, current flows in the wires, but none crosses the gap. Maxwell added a new term: a **changing electric field** creates a magnetic field, just as a current does. He called it the "displacement current". With it, the laws became perfectly symmetric: changing magnetic fields create electric fields (Faraday), and changing electric fields create magnetic fields (Maxwell).

## The four equations

In integral form, for any closed surface or loop:

$$
\oint \vec E \cdot d\vec A = \frac{Q_{\text{enc}}}{\varepsilon_0}
$$

$$
\oint \vec B \cdot d\vec A = 0
$$

$$
\oint \vec E \cdot d\vec l = -\frac{d\Phi_B}{dt}
$$

$$
\oint \vec B \cdot d\vec l = \mu_0 I_{\text{enc}} + \mu_0\varepsilon_0\frac{d\Phi_E}{dt}
$$

In words:

1. **Gauss's law**: electric field lines start and end on charges. (It contains Coulomb's law.)
2. **No magnetic monopoles**: magnetic field lines always close on themselves.
3. **Faraday's law**: a changing magnetic flux creates a circulating electric field.
4. **Ampère-Maxwell law**: currents *and changing electric fields* create circulating magnetic fields.

Together with the Lorentz force, $\vec F = q(\vec E + \vec v \times \vec B)$, they describe all of classical electromagnetism: every circuit, motor and antenna.

## Electromagnetic waves

Maxwell saw what his equations implied. A changing electric field makes a changing magnetic field, which makes a changing electric field, and so on: the disturbance sustains itself and **travels through empty space**, a wave of electric and magnetic fields, perpendicular to each other and to the direction of travel. Solving the equations, he found its speed:

$$
c = \frac{1}{\sqrt{\mu_0 \varepsilon_0}}
$$

```bash
node em.js light
```

```
1 / sqrt(mu0 eps0) = 1 / sqrt(1.256637e-6 x 8.854188e-12) = 299792458 m/s
measured speed of light: 299792458 m/s (exact, by the definition of the meter)
```

Two constants measured with capacitors and coils, in laboratories, give the speed of light. Maxwell wrote in 1864 that "light is an electromagnetic disturbance propagated through the field according to electromagnetic laws". Heinrich Hertz confirmed it in 1887 by generating and detecting radio waves; within two decades, Marconi was sending them across the Atlantic.

## The electromagnetic spectrum

All electromagnetic waves travel at $c$ in vacuum; they differ only in frequency $f$ and wavelength $\lambda$:

$$
c = f\lambda
$$

| Type | Wavelength | Typical sources and uses |
|---|---|---|
| radio | meters to kilometers | broadcasting, radar |
| microwaves | 1 mm to 30 cm | Wi-Fi, mobile phones, microwave ovens |
| infrared | 700 nm to 1 mm | heat radiation, remote controls, thermal cameras |
| visible light | 380–700 nm | the only part our eyes see |
| ultraviolet | 10–380 nm | sunburn, sterilization |
| X-rays | 0.01–10 nm | medical imaging |
| gamma rays | below 0.01 nm | nuclear decay |

```bash
node em.js wave 100e6
node em.js wave 5.45e14
```

```
wavelength = c / f = 2.998 m; photon energy hf = 6.626e-26 J = 413.6 neV
wavelength = c / f = 550.1 nm; photon energy hf = 3.611e-19 J = 2.254 eV
```

An FM radio station at 100 MHz broadcasts 3 m waves; green light, where our eyes are most sensitive, has a wavelength of 550 nm. The script also prints the **photon energy** $hf$: in the early 20th century it turned out that light is absorbed and emitted in packets of that energy, photons. A radio photon carries less than a microelectronvolt, far too little to affect a molecule; ultraviolet photons (3–12 eV and more) can break chemical bonds, which is why UV causes sunburn and radio waves don't. Maxwell's theory couldn't explain photons. That story is the subject of the course *Quantum Physics*.

## Energy carried by waves

Electromagnetic waves carry energy. The Sun delivers about 1,360 W per square meter above the atmosphere, and up to about 1,000 W/m² at the ground on a clear day: the energy source of all life and of solar panels. The intensity of a wave from a small source falls with the square of the distance, as the energy spreads over a sphere of area $4\pi r^2$.

## Check yourself

1. Wi-Fi uses 2.4 GHz and 5 GHz. What are the wavelengths?
2. How long does light take to reach us from the Sun (150 million km)? Radio signals from a Mars rover, when Mars is 225 million km away?
3. Why can't you get sunburned by the radio waves of a transmitter, however strong?
