# Contrast and accessibility

## Relative luminance

WCAG 2 measures how much light a color emits as its **relative luminance**: a weighted sum of the *linear* channels (lesson 1), with weights for how sensitive the eye is to each one:

$$
Y = 0.2126\,R + 0.7152\,G + 0.0722\,B
$$

Green dominates and blue barely counts. For `#2b59c3`, $Y = 0.2126(0.0242) + 0.7152(0.0999) + 0.0722(0.5457) \approx 0.116$.

## The contrast ratio

$$
\mathrm{CR} = \frac{Y_1 + 0.05}{Y_2 + 0.05}, \qquad Y_1 \ge Y_2
$$

It ranges from 1 (identical) to 21 (black on white: $1.05 / 0.05$). The $0.05$ models the ambient light reflected by the screen, which makes the darkest tones less dark than the numbers say.

`#2b59c3` on white: $(1 + 0.05)/(0.116 + 0.05) \approx 6.33$.

## The thresholds (WCAG 2.2, level AA)

| What | Minimum | Criterion |
|---|---|---|
| Body text | **4.5 : 1** | 1.4.3 |
| Large text (≥ 24 px, or ≥ 18.66 px bold) | **3 : 1** | 1.4.3 |
| UI components and meaningful graphics: input borders, icons, focus indicators, chart lines | **3 : 1** against adjacent colors | 1.4.11 |
| Level AAA: text / large text | 7 : 1 / 4.5 : 1 | 1.4.6 |

Disabled controls, decoration and logos are exempt.

## Solving instead of guessing

The ratio can be solved for the luminance you need. For a **darker** color on a background $Y_b$ with target ratio $R$:

$$
Y \le \frac{Y_b + 0.05}{R} - 0.05
$$

and for a **lighter** color: $Y \ge R\,(Y_b + 0.05) - 0.05$.

**Example: the lightest gray that passes 4.5:1 on white.** $Y \le 1.05/4.5 - 0.05 = 0.1833$. A gray has $R = G = B$, so encode $0.1833$ with the transfer function: $1.055 \times 0.1833^{1/2.4} - 0.055 \approx 0.465$, and $0.465 \times 255 \approx 118.7$. Rounding down to 118 gives **`#767676`** (4.54:1, passes). Rounding up gives `#777777` (4.48:1, fails). One unit of hex decides.

## Two facts that make palettes easy

**1. Contrast ratios multiply.** Write $\mathrm{CR}_W(x) = 1.05 / (Y_x + 0.05)$ for the contrast of a color $x$ with white. For two colors, $x$ lighter than $y$:

$$
\mathrm{CR}(x, y) = \frac{Y_x + 0.05}{Y_y + 0.05} = \frac{\mathrm{CR}_W(y)}{\mathrm{CR}_W(x)}
$$

So if you know every color's contrast with white, you know the contrast of every pair: just divide. The tonal scales in the next sub-chapter are built on this.

**2. Every color works with black or with white.** A color that has the same contrast with black and with white satisfies $\frac{1.05}{Y + 0.05} = \frac{Y + 0.05}{0.05}$, so $(Y + 0.05)^2 = 0.0525$, which gives $Y \approx 0.179$ and a contrast of $\approx 4.58$ with both. Any other color is further from one of them. So **every background passes 4.5:1 with black text or with white text**, but a mid-tone background ($Y$ near 0.18) passes only barely, with either.

## Text on semi-transparent colors

Text in `rgba(0, 0, 0, 0.5)` is not "black". Compute the color that actually shows (lesson *States and transparency*), then its contrast. On white, 50% black renders as `#808080`, which has only 3.95:1.

## Beyond WCAG 2

WCAG 2's formula is simple and is the legal standard in many places, but it is criticized for overrating some dark color pairs, which matters most in dark themes. **APCA**, a candidate method for the future WCAG 3, models perception more closely and takes font size and weight into account. Until it is final, meet WCAG 2.2 and use APCA as a second opinion for dark mode.

## In code

```js
import { contrastRatio, parseHex, wcagLevels } from './color.js';

const cr = contrastRatio(parseHex('#767676'), parseHex('#ffffff')); // 4.54
wcagLevels(cr); // { aaText: true, aaLargeText: true, aaNonText: true, aaaText: false, aaaLargeText: true }
```
