# Perceptual color: OKLab and OKLCH

A **perceptual** color space is designed so that equal distances look like equal differences. **OKLab** (Björn Ottosson, 2020) is one, simple enough to compute in a few lines. **OKLCH** is its polar form, and it's in CSS: `oklch(55% 0.18 262)`.

## From sRGB to OKLab

1. Linearize the channels with the sRGB transfer function (lesson 1), giving $R, G, B$.
2. Convert to an approximation of the cone responses, the LMS space:

$$
\begin{pmatrix} l \\ m \\ s \end{pmatrix} =
\begin{pmatrix}
0.4122214708 & 0.5363325363 & 0.0514459929 \\
0.2119034982 & 0.6806995451 & 0.1073969566 \\
0.0883024619 & 0.2817188376 & 0.6299787005
\end{pmatrix}
\begin{pmatrix} R \\ G \\ B \end{pmatrix}
$$

3. Apply the cube root, which compresses the values much as the eye compresses brightness:

$$
l' = \sqrt[3]{l}, \qquad m' = \sqrt[3]{m}, \qquad s' = \sqrt[3]{s}
$$


4. Mix into a lightness axis and two opponent-color axes ($a$: green to red, $b$: blue to yellow):

$$
\begin{pmatrix} L \\ a \\ b \end{pmatrix} =
\begin{pmatrix}
0.2104542553 & 0.7936177850 & -0.0040720468 \\
1.9779984951 & -2.4285922050 & 0.4505937099 \\
0.0259040371 & 0.7827717662 & -0.8086757660
\end{pmatrix}
\begin{pmatrix} l' \\ m' \\ s' \end{pmatrix}
$$

The inverse runs the steps backwards (the inverse matrices are in `color.js`).

**A check you can do by hand:** each row of the first matrix adds up to 1, so a gray with luminance $Y$ has $l = m = s = Y$. The first row of the second matrix also adds up to 1, so for grays

$$
L = \sqrt[3]{Y}
$$

The 50% gray `#808080` has $Y = 0.216$ and $L = \sqrt[3]{0.216} = 0.60$: it emits 22% of white's light and looks about 60% of the way to white.

## OKLCH: lightness, chroma, hue

Polar coordinates on the $(a, b)$ plane:

$$
C = \sqrt{a^2 + b^2}, \qquad h = \operatorname{atan2}(b, a)
$$

and back: $a = C \cos h$ and $b = C \sin h$.

| | $L$ | $C$ | $h$ |
|---|---|---|---|
| Meaning | perceived lightness, 0 to 1 (CSS also accepts 0% to 100%) | colorfulness, from 0 (gray) to about 0.32 for the most vivid sRGB colors (blue and magenta) | hue angle, in degrees |
| `#ff0000` | 0.628 | 0.258 | 29.2° |
| `#00ff00` | 0.866 | 0.295 | 142.5° |
| `#0000ff` | 0.452 | 0.313 | 264.1° |
| `#ffff00` | 0.968 | 0.211 | 109.8° |

Unlike HSL, $L$ now matches what you see: yellow is at 0.97 and blue at 0.45. Changing only $h$ keeps the lightness the same, and changing only $L$ keeps the hue (mostly) the same, which is the property palette building needs.

## The gamut is lumpy

Not every $(L, C, h)$ triple is a real sRGB color. The largest chroma available depends on both lightness and hue. At $L = 0.511$:

| hue | 277° (indigo) | 247° (blue) | 157° (green) | 97° (yellow) |
|---|---|---|---|---|
| max $C$ in sRGB | 0.278 | 0.134 | 0.122 | 0.105 |

Yellow simply can't be dark and vivid at the same time. When a computed color falls outside the gamut, **keep $L$ and $h$ and reduce $C$** until it fits. That keeps the lightness, which carries the contrast, and the hue, which carries the identity. A bisection does it:

```js
// the largest C' <= C such that (L, C', h) converts to RGB channels inside [0, 1]
let lo = 0, hi = c;
for (let i = 0; i < 30; i++) {
  const mid = (lo + hi) / 2;
  if (inGamut(oklabToRgb(oklchToOklab({ l, c: mid, h })))) lo = mid; else hi = mid;
}
```

## Color difference

Since OKLab is roughly perceptually uniform, the Euclidean distance measures how different two colors look:

$$
\Delta E_{\text{OK}} = \sqrt{(\Delta L)^2 + (\Delta a)^2 + (\Delta b)^2}
$$

A $\Delta E_{\text{OK}}$ around **0.02** is about the smallest difference most people notice; CSS Color 4 uses that threshold for gamut mapping. Two adjacent steps of a palette scale should be far above it.

## In CSS

```css
.button { background: oklch(58% 0.22 277); }
.button:hover { background: oklch(from var(--color-primary) calc(l - 0.07) c h); } /* relative color syntax */
```

`oklch()` works in all current browsers. Browsers gamut-map colors that a screen can't show, but your palette is more predictable if every value is already in sRGB, which is what `build-palette.js` emits.
