# Welcome to the course

Quantum physics is the most accurately tested theory in science, and the strangest. It explains why atoms are stable, why the Sun shines, how lasers, transistors, LEDs and MRI scanners work, and it is now the basis of a new kind of computer. It also says that, at the smallest scales, nature is fundamentally random, that particles can be in several states at once, and that two particles can be linked in ways no classical theory allows.

"I think I can safely say that nobody understands quantum mechanics," said Richard Feynman. But anyone can learn to *use* it, and to see where the strangeness lies. That is the aim of this course.

## What you will learn

1. **The quantum revolution**: blackbody radiation, photons and the photoelectric effect, atomic spectra and the Bohr model, matter waves.
2. **Wave mechanics**: the wave function, Born's rule, the Schrödinger equation, particles in wells, quantized energy, tunneling, the uncertainty principle.
3. **Spin and atoms**: spin, the Stern-Gerlach experiment, the Pauli principle, and why the periodic table looks as it does.
4. **Measurement and entanglement**: qubits, superposition, interference, measurement, entangled states, Bell's inequality and its experimental tests.
5. **Quantum computing**: gates and circuits, Deutsch's and Grover's algorithms, Shor's algorithm, and the state of the art.
6. **Project**: build and check three quantum circuits.

## The sample files

The tools are small Node.js scripts (Node 18 or later, no packages):

```bash
node quantum.js photoelectric 400 2.28            # light knocking electrons out of sodium
node quantum.js hydrogen                          # the energy levels and spectral lines of hydrogen
node schrodinger.js finite 1 0.5                  # solve the Schrödinger equation for a well
node qubits.js run 2 "H 0; CNOT 0 1" --shots 1000 # make and measure an entangled pair
node qubits.js chsh                               # Bell's inequality, violated
```

`schrodinger.js` solves the equation numerically, as physicists do for real problems, and `qubits.js` is a working (if small) quantum computer simulator. Every output in the pages comes from running them.

## What you need

High-school algebra, and comfort with exponentials, logarithms and trigonometry. Some pages use complex numbers ($i = \sqrt{-1}$) and vectors, explained where they appear. *Classical Mechanics* and *Electricity and Magnetism* are useful background (energy, momentum, waves, the electronvolt), but not required.
