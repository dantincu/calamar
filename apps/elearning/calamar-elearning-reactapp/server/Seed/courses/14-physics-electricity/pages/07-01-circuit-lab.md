# Bridges, batteries and a radio tuner

You need `circuit.js` and the three netlists of this page: `wheatstone.json`, `two-sources.json` and `radio.json`. For each circuit, **predict first** with the laws of the course, then simulate, then explain any difference.

## 1. Measuring a tiny change: the Wheatstone bridge

A **strain gauge** is a thin metal foil pattern glued onto a structure (a bridge girder, an aircraft wing, the beam inside a kitchen scale). When the structure stretches, the foil gets longer and thinner, and its resistance rises, by a tiny amount: a gauge of 120 Ω might change by 0.2 % under load, to 120.24 Ω. Measuring that directly with an ohmmeter is hard. The **Wheatstone bridge** (Samuel Hunter Christie, 1833; popularized by Charles Wheatstone) measures the *difference* instead.

Four resistors form two voltage dividers across the same supply: R1 over R2 gives node `a`, R3 over the gauge Rx gives node `b`. A voltmeter (here a 1 MΩ resistor) connects `a` and `b`. If all four were equal, `a` and `b` would both sit at exactly half the supply, and the meter would read zero: the bridge is **balanced**.

**Predict.** With a 5 V supply, $V_a = 2.5$ V. For node `b`:

$$
V_b = 5 \times \frac{120.24}{120 + 120.24} = 2.50250\ \text{V}, \qquad V_b - V_a \approx 2.5\ \text{mV}
$$

```bash
node circuit.js wheatstone.json
```

```
Wheatstone bridge: a strain gauge (Rx = 120.24 Ω) against three 120 Ω resistors, 5 V supply
DC analysis

  V(a) = 2.500 V
  V(b) = 2.502 V
  V(top) = 5.000 V

  element   current       voltage       power
  (current from the element's first node to its second; a source that delivers power carries a negative current)

  V1        -41.646 mA       5.000 V   208.229 mW delivered
  R1         20.833 mA       2.500 V    52.083 mW absorbed
  R2         20.833 mA       2.500 V    52.083 mW absorbed
  R3         20.813 mA       2.498 V    51.979 mW absorbed
  Rx         20.813 mA       2.502 V    52.083 mW absorbed
  Rmeter     -2.497 nA     -2.497 mV     0.006 nW absorbed

  power delivered by sources 208.229 mW, absorbed 208.229 mW
```

The meter sees 2.497 mV: a small signal, but measured against **zero**, not against 2.5 V, so an amplifier can magnify it a thousand times without being swamped. The bridge also cancels common disturbances: if the supply voltage drifts, both dividers drift together; if the temperature changes, a second, unstrained gauge in place of R3 changes too, and the bridge stays balanced. Every digital kitchen scale and bathroom scale contains such a bridge.

**Exercise 1.** For small changes, show that $V_b - V_a \approx \frac{V}{4}\frac{\Delta R}{R}$. Check it against the simulation. Then replace R3 with a second gauge that also changes by +0.24 Ω (the temperature compensation above). What does the meter read?

## 2. Two batteries in parallel

What happens if you connect a fresh 12 V battery and a weaker 9 V battery in parallel to the same 4 Ω load? (Each has an internal resistance: 0.5 Ω and 1 Ω.)

**Predict** with nodal analysis. One unknown, the voltage $V$ of the top node. KCL: the currents from the two batteries add up to the load current:

$$
\frac{12 - V}{0.5} + \frac{9 - V}{1} = \frac{V}{4} \quad\Rightarrow\quad V = \frac{24 + 9}{2 + 1 + 0.25} = 10.15\ \text{V}
$$

```bash
node circuit.js two-sources.json
```

```
Two batteries in parallel on a 4 Ω load: 12 V (internal resistance 0.5 Ω) and 9 V (internal resistance 1 Ω)
DC analysis

  V(p1) = 12.000 V
  V(p2) = 9.000 V
  V(top) = 10.154 V

  element   current       voltage       power
  (current from the element's first node to its second; a source that delivers power carries a negative current)

  B1          -3.692 A      12.000 V     44.308 W delivered
  r1           3.692 A       1.846 V      6.817 W absorbed
  B2           1.154 A       9.000 V     10.385 W absorbed
  r2          -1.154 A      -1.154 V      1.331 W absorbed
  Rload        2.538 A      10.154 V     25.775 W absorbed

  power delivered by sources 44.308 W, absorbed 44.308 W
```

The surprise: battery B2 **absorbs** 10.4 W. The top node, at 10.15 V, is above B2's 9 V, so current is forced *into* the weaker battery. Of the 44.3 W the strong battery delivers, only 25.8 W reaches the load; the rest heats the internal resistances or goes into B2. With a rechargeable battery that is charging it, uncontrolled; with a non-rechargeable one it can make it leak or burst. That is why you should never mix old and new batteries in a device, and why battery packs that connect cells in parallel match them carefully.

**Exercise 2.** Set both batteries to 12 V. How do they now share the current? What happens if the internal resistances are equal?

## 3. Choosing a station: the radio tuner

An antenna picks up every station at once, each a tiny voltage at its own frequency. A tuner is a series RLC circuit, resonant at the chosen station's frequency, with the output taken across the capacitor. Turning the dial changes the capacitance.

**Predict.** With $L = 250$ µH and $C = 101$ pF:

$$
f_0 = \frac{1}{2\pi\sqrt{LC}} = \frac{1}{2\pi\sqrt{250 \times 10^{-6} \times 101 \times 10^{-12}}} \approx 1.0\ \text{MHz}, \qquad Q = \frac{1}{R}\sqrt{\frac{L}{C}} \approx 79
$$

so a station at 1 MHz should appear across the capacitor about 79 times larger than at the antenna.

```bash
node circuit.js radio.json --sweep 800000 1250000 out 18
```

```
AM radio tuner: 1 mV from the antenna, L = 250 µH (coil resistance 20 Ω), C = 101 pF; output across C
frequency sweep, probing V(out) relative to the source amplitude

   frequency        |V|      gain (dB)   phase
    800000.0 Hz    0.0028       8.8     -1.6°
    905584.3 Hz    0.0055      14.8     -3.6°
    951621.9 Hz    0.0102      20.2     -7.1°
    975511.1 Hz    0.0189      25.5    -13.5°
   1000000.0 Hz    0.0764      37.7    -76.0°
   1025103.6 Hz    0.0203      26.2   -164.7°
   1050837.5 Hz    0.0098      19.9   -172.5°
   1104259.4 Hz    0.0046      13.3   -176.3°
   1250000.0 Hz    0.0018       5.1   -178.4°

largest response in this sweep: 76.441 of the source at about 1000000 Hz
```

(Selected rows; $|V|$ is in volts.) At exactly 1 MHz, just below the resonance of 1.0016 MHz, the 1 mV signal becomes 76 mV. Compare two stations, at the resonance and 100 kHz away:

```bash
node circuit.js radio.json --ac 1001000
node circuit.js radio.json --ac 1100000
```

```
  V(out) =   78.376 mV  at  -84.7°
  V(out) =    4.839 mV  at -176.1°
```

(Just the output lines.) The tuned station comes out 16 times stronger than its neighbor, with no amplifier at all. Real receivers add more tuned stages and amplification, but the first selection is pure resonance.

**Exercise 3.** What capacitance tunes the circuit to 1,500 kHz? To 600 kHz? (The European medium-wave band runs from 531 to 1,602 kHz; a classic tuning capacitor spans roughly 30 to 400 pF.) Edit `radio.json` and check with a sweep.

**Exercise 4.** A cheaper coil has a resistance of 60 Ω. Predict $Q$, then simulate. How much does the neighboring station at 1.1 MHz now leak through, relative to the tuned one?

## What this shows

Three circuits, three ideas: measure a difference against zero, not a small change against a large value; sources in parallel don't simply "add up", they push current into each other; and resonance picks one frequency out of many. All three were solved with the same two laws of Kirchhoff, in one small program, as engineers solve circuits with millions of components.

Congratulations on finishing the course.
