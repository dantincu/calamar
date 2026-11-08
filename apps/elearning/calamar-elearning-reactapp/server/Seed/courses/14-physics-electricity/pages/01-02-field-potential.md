# Electric field, potential and capacitors

## The electric field

Michael Faraday pictured charges as filling the space around them with a **field**: at every point, the force a small positive test charge $q$ would feel, per unit charge:

$$
\vec E = \frac{\vec F}{q}, \qquad E = k\frac{Q}{r^2} \ \text{for a point charge } Q
$$

in newtons per coulomb, or equivalently volts per meter. Field lines start on positive charges and end on negative ones; where they are dense, the field is strong. Fields from several charges add as vectors.

**A dipole**: $+1$ nC and $-1$ nC, 4 cm apart, on the $x$ axis.

```bash
node em.js field 0,0 1e-9@-0.02,0 -1e-9@0.02,0
node em.js field 0,0.03 1e-9@-0.02,0 -1e-9@0.02,0
```

```
at (0, 0) m:
  E = (4.494e+4, 0.000e+0) V/m, |E| = 44.94 kV/m, direction 0.0°
  V = 0 V
at (0, 0.03) m:
  E = (7.670e+3, 0.000e+0) V/m, |E| = 7.670 kV/m, direction 0.0°
  V = 0 V
```

Between the charges, both fields point from $+$ to $-$ and add up. Above the middle, the vertical parts cancel and the field still points from $+$ toward $-$, weaker. Molecules such as water are dipoles, which is why they attract each other.

In a **conductor** at rest, the field inside is zero: otherwise its free charges would move until it was. Any excess charge sits on the surface. That is why a metal car or plane protects you from lightning (a **Faraday cage**), and why your phone loses signal in a lift.

## Electric potential

Moving a charge against the field takes work, which is stored as potential energy, like lifting a mass against gravity. The **potential** $V$ is the potential energy per unit charge, in **volts** (1 V = 1 J/C):

$$
V = k\frac{Q}{r} \ \text{for a point charge}, \qquad \Delta U = q\,\Delta V
$$

Potential is a scalar, so potentials from several charges simply add, without directions. In the dipole above, every point on the perpendicular bisector is equally far from both charges, so $V = 0$ there, even though $E$ isn't zero. The field points "downhill" in potential, from high to low, and its strength is the steepness:

$$
E = -\frac{dV}{dx}, \qquad E = \frac{V}{d} \ \text{between parallel plates}
$$

The **voltage** of a battery is the potential difference between its terminals: a 9 V battery gives each coulomb that passes through it 9 J of energy.

A useful unit for atoms: the **electronvolt**, the energy an electron gains crossing 1 V: $1\ \text{eV} = 1.602 \times 10^{-19}$ J. Chemical bonds are a few eV; visible light photons 1.6–3.3 eV.

## Capacitors

A **capacitor** stores charge: two conducting plates separated by an insulator. Charge $+Q$ on one plate and $-Q$ on the other produce a voltage $V$ proportional to $Q$. The ratio is the **capacitance**, in **farads** (F):

$$
C = \frac{Q}{V}, \qquad C = \varepsilon_r \varepsilon_0 \frac{A}{d} \ \text{for parallel plates}
$$

with plate area $A$, gap $d$ and the insulator's **relative permittivity** $\varepsilon_r$ (1 for vacuum or air, about 3–10 for common plastics and ceramics, and up to thousands in special ceramics).

```bash
node em.js capacitor 0.01 0.001 1 12
```

```
C = eps_r eps0 A / d = 88.54 pF
at 12 V: charge Q = CV = 1.063 nC, field E = V/d = 12.00 kV/m, energy ½CV² = 6.375 nJ
```

Two plates of 10 cm × 10 cm, 1 mm apart, give only 89 picofarads: a farad is huge. Real capacitors reach microfarads by rolling up very thin films with large areas, and "supercapacitors" reach thousands of farads using porous carbon with enormous internal surface.

The stored energy is:

$$
U = \tfrac12 C V^2
$$

A camera flash charges a capacitor slowly from its battery and dumps the energy in a millisecond; a defibrillator stores a few hundred joules and delivers them in milliseconds.

## Check yourself

1. What is the electric field 10 cm from a 5 nC point charge? The potential?
2. An electron is accelerated from rest through 1,000 V. What is its kinetic energy in eV and in joules?
3. Doubling the gap between the plates of an isolated charged capacitor (constant $Q$): what happens to $C$, $V$ and the stored energy? Where does the extra energy come from?
