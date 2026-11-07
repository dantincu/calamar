# Welcome to the course

UX design is the work of making a product **useful, usable and pleasant** for the people who rely on it. This course takes you from the process (research, structure, prototypes, testing) to the craft (hierarchy, type, spacing). Then it spends its longest chapter on something every web app needs and few teams get right: **a color palette that is attractive, consistent and accessible by construction**.

## What you will learn

1. **Foundations**: what UX is, how research works, and the heuristics experienced designers check first.
2. **Structure and interaction**: information architecture, user flows, wireframes and prototypes, and the "laws" of interaction (Fitts, Hick) with their formulas.
3. **Visual design**: hierarchy, Gestalt principles, modular type scales and spacing grids.
4. **Color palettes for web apps**: how screens make color, the math of sRGB, HSL and OKLCH, WCAG contrast, tonal scales placed by contrast, neutrals, semantic colors, design tokens, dark mode and color vision deficiencies.
5. **Testing with users**: how many users to test with, and how to put a number on usability.
6. **A final project**: the complete palette for an app, generated, checked and applied.

## About the math

Color is where intuition fails most often. "50% lightness" in HSL can mean a near-white yellow or a deep blue. So the color lessons use formulas, written like this: the contrast ratio is

$$
\mathrm{CR} = \frac{Y_{\text{lighter}} + 0.05}{Y_{\text{darker}} + 0.05}
$$

You don't need more than high-school algebra. Every formula is also implemented in the sample files (`color.js`, `scale.js`, `build-palette.js`), so you can run it instead of computing by hand.

## The sample files

Pages with code have files attached; download them into one folder. They are plain JavaScript modules with no dependencies and run with Node 18 or later:

```bash
node build-palette.js > palette.css   # generate the palette
node build-palette.js --report        # check every text/background pair
```

Let's start.
