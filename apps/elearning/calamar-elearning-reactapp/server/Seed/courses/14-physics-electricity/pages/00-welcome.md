# Welcome to the course

Electricity and magnetism explain lightning and compass needles, but also the chemistry of every atom, the signals in your nerves, and every device you own. Their laws were worked out in the 18th and 19th centuries by Coulomb, Volta, Ampère, Ohm, Faraday and, finally, Maxwell, whose equations unified them and revealed that light is an electromagnetic wave.

## What you will learn

1. **Electrostatics**: charge, Coulomb's law, the electric field and potential, capacitors.
2. **DC circuits**: current, resistance, Ohm's law, power, series and parallel networks, Kirchhoff's laws, nodal analysis, and RC charging.
3. **Magnetism**: the force on moving charges and currents (motors, particle beams), and the magnetic fields of wires and coils.
4. **Induction**: Faraday's and Lenz's laws, generators, transformers and the power grid, inductors.
5. **Alternating current**: RMS values, impedance, filters and resonance.
6. **Electromagnetic waves**: Maxwell's equations, the speed of light, the electromagnetic spectrum.
7. **Project**: a circuit lab with a strain-gauge bridge, two batteries in parallel, and a radio tuner.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages):

```bash
node em.js coulomb 1e-6 -2e-6 0.05             # the force between two charges
node em.js rc 10000 100e-6 9                    # a capacitor charging
node circuit.js divider.json                    # solve a DC circuit
node circuit.js rlc.json --sweep 1000 2500 out  # the frequency response of a tuned circuit
node em.js light                                # the speed of light from two constants
```

`circuit.js` reads a circuit from a small JSON file (a **netlist**). The course provides several; writing your own is the best way to learn circuits.

## What you need

High-school algebra and trigonometry. Some formulas use vectors and, in the AC chapter, complex numbers, which the course explains. It helps (but isn't required) to have taken *Classical Mechanics* first, for force, energy and oscillations.

## A note on safety

Mains electricity (230 V in Europe) can kill. The calculations here are for understanding; any hands-on experiments should use batteries of a few volts.
