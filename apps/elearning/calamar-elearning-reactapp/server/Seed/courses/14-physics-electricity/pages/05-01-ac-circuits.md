# Impedance, filters and resonance

## Alternating voltage and RMS

Mains electricity is a sine wave: $V(t) = V_0 \sin(2\pi f t)$, with $f = 50$ Hz in Europe. Its average is zero, so to describe its strength we use the **root-mean-square** value, the steady voltage that would heat a resistor equally:

$$
V_{\text{rms}} = \frac{V_0}{\sqrt 2}
$$

"230 V" is the RMS value; the actual peak is $230\sqrt 2 = 325$ V.

## Capacitors and inductors in AC

A resistor obeys Ohm's law at every instant. Capacitors and inductors don't: their current and voltage are out of step.

- In a **capacitor**, the current leads the voltage by 90°: current flows most when the voltage is changing fastest. A capacitor passes high frequencies easily and blocks DC.
- In an **inductor**, the current lags the voltage by 90°. An inductor passes DC easily and opposes high frequencies.

Their opposition to AC is the **reactance**, in ohms:

$$
X_C = \frac{1}{\omega C}, \qquad X_L = \omega L, \qquad \omega = 2\pi f
$$

## Impedance and complex numbers

To combine resistance and reactance, engineers use **complex numbers**, with $j = \sqrt{-1}$ (physicists' $i$, renamed because $i$ means current). Each component gets an **impedance** $Z$:

$$
Z_R = R, \qquad Z_L = j\omega L, \qquad Z_C = \frac{1}{j\omega C} = -\frac{j}{\omega C}
$$

and then everything from the DC chapter works unchanged, with complex numbers: Ohm's law $V = IZ$, series and parallel rules, Kirchhoff's laws and nodal analysis. The **magnitude** of a complex voltage is the amplitude of the sine wave, and its **angle** is the phase shift. That is what `circuit.js --ac` and `--sweep` do: the same nodal analysis as for DC, with complex admittances.

## The RC low-pass filter

A resistor in series with a capacitor, with the output taken across the capacitor, is a voltage divider with a frequency-dependent ratio:

$$
\frac{V_{\text{out}}}{V_{\text{in}}} = \frac{Z_C}{R + Z_C} = \frac{1}{1 + j\omega RC}, \qquad \left|\frac{V_{\text{out}}}{V_{\text{in}}}\right| = \frac{1}{\sqrt{1 + (\omega RC)^2}}
$$

At low frequencies the capacitor barely conducts, and the output equals the input; at high frequencies it shorts the output. The **cutoff frequency**, where the output falls to $1/\sqrt 2$ (−3 dB), is $f_c = 1/(2\pi RC)$. With 1.6 kΩ and 100 nF, $f_c \approx 995$ Hz:

```bash
node circuit.js lowpass.json --sweep 10 100000 out
```

```
   frequency        |V|      gain (dB)   phase
        10.0 Hz    0.9999      -0.0     -0.6°
       100.0 Hz    0.9950      -0.0     -5.7°
       316.2 Hz    0.9530      -0.4    -17.6°
      1000.0 Hz    0.7052      -3.0    -45.2°
      3162.3 Hz    0.3001     -10.5    -72.5°
     10000.0 Hz    0.0990     -20.1    -84.3°
    100000.0 Hz    0.0099     -40.0    -89.4°
```

(Selected rows of the 25-frequency sweep.) Gains are often given in **decibels**: $20\log_{10}|V_{\text{out}}/V_{\text{in}}|$. Above the cutoff, the output falls by 20 dB, a factor of 10, for every tenfold increase in frequency. Swap the resistor and capacitor and you get a **high-pass** filter. Audio equipment uses such filters to split sound between woofers and tweeters, and to remove hiss or hum.

## Resonance

Put an inductor and a capacitor in series. Their reactances have opposite signs, and at one frequency they cancel exactly, $\omega L = 1/(\omega C)$:

$$
f_0 = \frac{1}{2\pi\sqrt{LC}}
$$

At that **resonant frequency** the circuit's impedance is just $R$, and the current is largest. With $L = 10$ mH and $C = 1$ µF, $f_0 = 1591.5$ Hz:

```bash
node circuit.js rlc.json --ac 1591.5
```

```
Series RLC band-pass: 1 V source, L = 10 mH, C = 1 µF, R = 10 Ω, output across R
AC analysis at f = 1591.5 Hz (omega = 9999.7 rad/s); amplitudes and phases

  V(a) =    10.050 V  at  -84.3°
  V(in) =     1.000 V  at    0.0°
  V(out) = 1000.000 mV  at    0.0°
```

At resonance, the full 1 V appears across the resistor, and the current is 100 mA. Look at node `a`, between the inductor and the capacitor: **10 V**, ten times the source voltage! The voltages across L and C are each about 10 V, but opposite in phase, so they cancel in the loop. This voltage magnification is the circuit's **quality factor**:

$$
Q = \frac{1}{R}\sqrt{\frac{L}{C}} = \frac{1}{10}\sqrt{\frac{0.01}{10^{-6}}} = 10
$$

Exactly the same mathematics as the damped, driven oscillator in *Classical Mechanics*: the inductor plays the mass, the capacitor the spring, the resistor the friction. Sweep around the resonance:

```bash
node circuit.js rlc.json --sweep 1000 2500 out 12
```

```
   frequency        |V|      gain (dB)   phase
      1000.0 Hz    0.1033     -19.7     84.1°
      1165.0 Hz    0.1558     -16.2     81.0°
      1357.2 Hz    0.2984     -10.5     72.6°
      1464.9 Hz    0.5159      -5.7     58.9°
      1581.1 Hz    0.9915      -0.1      7.5°
      1706.6 Hz    0.5821      -4.7    -54.4°
      1842.0 Hz    0.3227      -9.8    -71.2°
      2145.9 Hz    0.1626     -15.8    -80.6°
      2500.0 Hz    0.1064     -19.5    -83.9°
```

(Selected rows.) The circuit passes a narrow band around $f_0$, with a width of about $f_0/Q$, and rejects the rest: a **band-pass filter**. Radio tuners work this way (the project uses one).

## Power in AC circuits

Only resistors dissipate energy; ideal capacitors and inductors store it and give it back each cycle. The average power is:

$$
P = V_{\text{rms}} I_{\text{rms}} \cos\varphi
$$

where $\varphi$ is the phase between voltage and current, and $\cos\varphi$ the **power factor**. Motors and other inductive loads have power factors below 1: they draw more current than their power needs, loading the wires. Factories add capacitors to correct it.

## Check yourself

1. What is the reactance of a 10 µF capacitor at 50 Hz? At 5 kHz?
2. Design an RC low-pass filter with a cutoff of 3 kHz using a 10 nF capacitor. Check it with a netlist.
3. Change R in `rlc.json` to 1 Ω. What happens to the voltage at node `a` at resonance, and to the width of the band? Why?
