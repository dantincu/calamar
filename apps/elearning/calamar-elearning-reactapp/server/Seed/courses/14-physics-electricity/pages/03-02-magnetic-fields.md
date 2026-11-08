# Magnetic fields of currents

## Ørsted's discovery

In 1820, during a lecture, Hans Christian Ørsted noticed that a compass needle moved when he switched on a current in a nearby wire. It was the first link between electricity and magnetism: **currents create magnetic fields**. Within weeks André-Marie Ampère had worked out the laws.

## A long straight wire

The field lines around a straight wire are circles centered on the wire (right-hand rule: thumb along the current, fingers curl along the field). The field strength falls with distance:

$$
B = \frac{\mu_0 I}{2\pi r}
$$

where $\mu_0 = 4\pi \times 10^{-7}$ T·m/A (to excellent accuracy) is the **permeability of free space**.

```bash
node em.js wire 10 0.05
```

```
B = mu0 I / (2 pi r) = 40.00 µT (the Earth's field is about 50 µT: this is 0.80 times that)
```

A wire carrying 10 A creates, 5 cm away, a field comparable to the Earth's: enough to deflect a compass, as Ørsted saw. (Household cables cause no such effect, because they have two wires with opposite currents side by side, whose fields almost cancel.)

**Two parallel wires** each sit in the other's field, so they exert forces on each other: attraction if the currents flow the same way, repulsion if opposite. The force per meter is $\mu_0 I_1 I_2 / (2\pi d)$. Until 2019, this force defined the ampere: the current that, in two wires 1 m apart, gives $2 \times 10^{-7}$ N per meter.

## Ampère's law

For any closed loop, the field along it, added up all the way round, is proportional to the current passing through the loop:

$$
\oint \vec B \cdot d\vec l = \mu_0 I_{\text{enclosed}}
$$

For the straight wire, take a circle of radius $r$: $B \times 2\pi r = \mu_0 I$, which gives the formula above. Ampère's law is one of Maxwell's four equations (with an extra term that the waves chapter adds).

## The solenoid

Wind a wire into a long coil, a **solenoid**. The fields of the turns add up inside and nearly cancel outside. Applying Ampère's law to a rectangle half inside the coil gives a uniform field inside:

$$
B = \mu_0 n I, \qquad n = \frac{N}{L} \ \text{turns per meter}
$$

```bash
node em.js solenoid 1000 0.2 2
```

```
B = mu0 (N/L) I = 12.57 mT
```

A thousand turns over 20 cm with 2 A gives 12.6 mT, about 250 times the Earth's field. Fill the coil with iron, whose atoms line up with the field and add their own, and the field becomes hundreds or thousands of times stronger: an **electromagnet**, as in relays, loudspeakers, door locks and scrap-yard cranes. MRI scanners use superconducting solenoids: with no resistance, they carry hundreds of amperes indefinitely without heating.

## Where magnetism comes from

A permanent magnet has no wires. Its field comes from its electrons, which behave as tiny magnets because of their **spin**, a quantum property (see the course *Quantum Physics*). In most materials the electron magnets point randomly and cancel. In **ferromagnetic** materials (iron, nickel, cobalt and some alloys), neighboring electrons line up in regions called **domains**; magnetizing the material aligns the domains. Heat above the **Curie temperature** (770 °C for iron) and the alignment is lost.

The **Earth's field** comes from currents in its molten iron outer core, a self-sustaining dynamo. It has reversed many times; the last full reversal was about 780,000 years ago, recorded in the magnetization of volcanic rocks on the ocean floor.

## Check yourself

1. At what distance from a wire carrying 100 A is the field equal to 50 µT?
2. Two parallel wires 1 cm apart each carry 20 A in the same direction. What is the force on each meter of wire? Attractive or repulsive?
3. How many turns per meter does a solenoid need to make 0.1 T with 5 A?
