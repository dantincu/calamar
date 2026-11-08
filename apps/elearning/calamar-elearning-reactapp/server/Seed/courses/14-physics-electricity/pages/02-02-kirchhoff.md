# Kirchhoff's laws and circuit analysis

## Series and parallel

Resistors in **series** carry the same current, and their voltages add:

$$
R_{\text{series}} = R_1 + R_2 + \cdots
$$

Resistors in **parallel** share the same voltage, and their currents add:

$$
\frac{1}{R_{\text{parallel}}} = \frac{1}{R_1} + \frac{1}{R_2} + \cdots, \qquad R_1 \parallel R_2 = \frac{R_1 R_2}{R_1 + R_2}
$$

The parallel combination is always smaller than the smallest resistor: a new path makes it easier for current to flow. Household sockets are wired in parallel, so each appliance gets the full voltage and can be switched on its own.

## The voltage divider

Two resistors in series across a voltage $V$ split it in proportion:

$$
V_{\text{out}} = V\frac{R_2}{R_1 + R_2}
$$

12 V across 1 kΩ and 2 kΩ gives 8 V across the 2 kΩ. But connect a load to the output, and it is in parallel with $R_2$, changing the division. With a 2 kΩ load, $R_2 \parallel R_{\text{load}} = 1$ kΩ, and the output falls to 6 V.

## Kirchhoff's laws

Gustav Kirchhoff (1845) gave two rules that solve any circuit:

1. **The current law (KCL)**: the currents flowing into a node (a junction) add up to the currents flowing out. Charge doesn't pile up.
2. **The voltage law (KVL)**: around any closed loop, the voltage rises and drops add up to zero. Energy is conserved: a charge that goes round a loop returns to the same potential.

## Nodal analysis

The systematic way to apply them: pick one node as **ground** (0 V), give every other node an unknown voltage, and write KCL at each node, using Ohm's law for the currents ($I = (V_a - V_b)/R$ through a resistor between nodes $a$ and $b$). This gives as many linear equations as unknowns. Voltage sources add an unknown current each, and an equation fixing their voltage: the **modified nodal analysis** used inside SPICE, the circuit simulator behind almost all electronics design since the 1970s.

`circuit.js` does exactly that. The divider with its load, as a netlist:

```json
{
  "title": "Voltage divider: 12 V across 1 kΩ and 2 kΩ in series, with a 2 kΩ load",
  "elements": [
    { "type": "V", "name": "V1", "nodes": ["in", "0"], "value": 12 },
    { "type": "R", "name": "R1", "nodes": ["in", "out"], "value": 1000 },
    { "type": "R", "name": "R2", "nodes": ["out", "0"], "value": 2000 },
    { "type": "R", "name": "Rload", "nodes": ["out", "0"], "value": 2000 }
  ]
}
```

```bash
node circuit.js divider.json
```

```
Voltage divider: 12 V across 1 kΩ and 2 kΩ in series, with a 2 kΩ load
DC analysis

  V(in) = 12.000 V
  V(out) = 6.000 V

  element   current       voltage       power
  (current from the element's first node to its second; a source that delivers power carries a negative current)

  V1         -6.000 mA      12.000 V    72.000 mW delivered
  R1          6.000 mA       6.000 V    36.000 mW absorbed
  R2          3.000 mA       6.000 V    18.000 mW absorbed
  Rload       3.000 mA       6.000 V    18.000 mW absorbed

  power delivered by sources 72.000 mW, absorbed 72.000 mW
```

Check the laws on the result: at node `out`, 6 mA flows in through R1, and 3 + 3 mA flows out through R2 and the load (KCL). Around the loop V1 → R1 → R2: $12 - 6 - 6 = 0$ (KVL). And the power balances: the source delivers exactly what the resistors turn into heat.

## Real sources have internal resistance

A real battery behaves like an ideal voltage source $\mathcal{E}$ (its **EMF**) in series with an internal resistance $r$. Its terminal voltage falls as it delivers more current:

$$
V_{\text{terminal}} = \mathcal{E} - Ir
$$

A car battery (12.6 V, about 0.01 Ω) can deliver hundreds of amperes to the starter motor; a 9 V battery (internal resistance of about 1–2 Ω) can't, and gets warm if you short it. The maximum power goes to a load when its resistance equals the internal resistance: the **maximum power transfer theorem**, important in audio and radio, where the source and load are "matched".

## Check yourself

1. What is the resistance of 100 Ω, 200 Ω and 300 Ω in parallel?
2. Write a netlist for a 9 V battery with three 1 kΩ resistors: two in parallel, in series with the third. Predict the current from the battery, then check with `circuit.js`.
3. Why does the output of a voltage divider fall when you connect a load? How should you choose $R_1$ and $R_2$ so that a 10 kΩ load changes it by less than 1 %?
