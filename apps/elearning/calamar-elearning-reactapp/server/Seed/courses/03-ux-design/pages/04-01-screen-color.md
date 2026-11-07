# How screens make color

## Additive RGB

Each pixel mixes red, green and blue light. A CSS hex code stores one byte per channel: `#2b59c3` means $R = \texttt{0x2b} = 43$, $G = \texttt{0x59} = 89$ and $B = \texttt{0xc3} = 195$, out of 255. Dividing by 255 gives channels in $[0, 1]$:

$$
(R', G', B') = \left(\tfrac{43}{255}, \tfrac{89}{255}, \tfrac{195}{255}\right) \approx (0.169,\ 0.349,\ 0.765)
$$

## These numbers are not light intensities

The channel values $R', G', B'$ are **gamma-encoded**: the amount of light the screen emits is not proportional to them. `#808080` ("50% gray") emits only about **22%** of white's light, but it *looks* close to halfway between black and white. That is the point of the encoding: human vision is far more sensitive to differences between dark tones than between light ones, so the encoding spends more of its 256 levels on the darks.

The **sRGB transfer function** converts an encoded channel $C'$ into linear light $C$:

$$
C = \begin{cases}
\dfrac{C'}{12.92} & \text{if } C' \le 0.04045 \\[2ex]
\left(\dfrac{C' + 0.055}{1.055}\right)^{2.4} & \text{otherwise}
\end{cases}
$$

and back:

$$
C' = \begin{cases}
12.92\, C & \text{if } C \le 0.0031308 \\[1ex]
1.055\, C^{1/2.4} - 0.055 & \text{otherwise}
\end{cases}
$$

The overall curve is close to $C \approx C'^{\,2.2}$, which is why people talk about "gamma 2.2". For `#2b59c3`, the linear channels are $(0.0242,\ 0.0999,\ 0.5457)$. The red channel encoded as 0.169 contributes just 2.4% of full red light.

## Why designers should care

- **Luminance** (how much light a color emits) is computed from *linear* values. Contrast ratios (lesson 4) are based on it.
- **Mixing and blending** give different results in gamma-encoded and linear space. CSS blends encoded values by default, which is why a gradient from red to green in sRGB passes through a muddy brown. `color-mix()` and gradients let you choose a better space: `linear-gradient(in oklch, red, green)`.
- **Equal steps in hex are not equal-looking steps.** Neither HSL (next lesson) nor hex fixes that; OKLCH (lesson 3) does.

## Gamuts

**sRGB** is the color space of the web and the set of colors every screen can show. Many screens now show **Display P3**, which is about 25% larger, especially in saturated greens and reds. CSS can address it with `color(display-p3 …)` or with `oklch()` values outside sRGB. For a palette that must look the same everywhere, design inside sRGB. The attached `color.js` maps any color into sRGB.

## In code

```js
import { parseHex, toLinear } from './color.js';

const { r, g, b } = parseHex('#2b59c3');
[r, g, b].map(toLinear); // [0.0242, 0.0999, 0.5457]
```
