# Typography and type scales

Most of an app's interface is text. Readable text depends on three numbers (size, line length and line height), and a consistent hierarchy depends on a **type scale**.

## Body text

- **Size**: 16 px is the usual minimum for body text on the web. Use `rem` units so text follows the user's browser setting.
- **Line length** (the *measure*): 45 to 75 characters per line. In CSS, `max-width: 65ch` is a good start.
- **Line height**: about 1.4 to 1.6 for body text, and less for headings (1.1 to 1.3), because large text with loose spacing falls apart.

## A modular scale

Instead of picking sizes one by one (13, 15, 17, 22, 29…), derive them from a base size $f_0$ and a ratio $r$:

$$
f_n = f_0 \cdot r^{\,n}, \qquad n \in \{\dots, -2, -1, 0, 1, 2, \dots\}
$$

With $f_0 = 16\,\text{px}$ and $r = 1.25$ (a "major third"):

| $n$ | −2 | −1 | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|---|---|
| px | 10.24 | 12.8 | **16** | 20 | 25 | 31.25 | 39.06 | 48.83 |

Each step is the same *ratio* larger than the one before, so the hierarchy feels even. Common ratios range from 1.125 (dense apps) to 1.333 or 1.5 (editorial and marketing pages). Round to whole pixels if you like; the ratio still shows.

`ux-math.js` (attached to the Fitts's law page) has `typeScale(base, ratio)`.

## Fluid sizes

Headings can grow with the viewport between two limits. A linear interpolation from size $s_1$ at width $w_1$ to $s_2$ at $w_2$ has slope $m = (s_2 - s_1)/(w_2 - w_1)$, which gives the CSS:

```css
/* 28px at 400px wide, growing to 40px at 1200px wide */
h1 { font-size: clamp(1.75rem, calc(1.375rem + 1.5vw), 2.5rem); }
```

Here $m = (40 - 28)/(1200 - 400) = 0.015$, that is $1.5\,\text{vw}$. The intercept is $28 - 0.015 \times 400 = 22\,\text{px} = 1.375\,\text{rem}$.

## Type and color

Text color is a contrast problem, not a taste problem. Gray text that looks elegant at 14 px may fail WCAG's 4.5:1 minimum. Chapter 4 shows how to compute that, and how to build gray scales that pass by construction.
