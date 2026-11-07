# Color Palettes for Web Apps

A web app's palette is not a mood board. It is a **system**: a few base colors expanded into scales, mapped to roles (text, surfaces, actions, status), and checked against accessibility rules in both light and dark themes.

This chapter builds that system from first principles:

1. **How screens make color**: RGB, hex codes and the sRGB transfer function.
2. **HSL**, the popular color model, and why its "lightness" can't be trusted.
3. **OKLab and OKLCH**, perceptual color spaces in which equal numbers mean equal-looking steps.
4. **Contrast**: the WCAG formulas, and how to *solve* them instead of trying colors until one passes.
5. **Building the palette**: brand hue and harmonies, tonal scales placed by contrast, neutrals and semantic colors.
6. **Applying the palette**: design tokens, dark mode, interaction states and transparency, color vision deficiencies, and testing.

All the math is in the attached modules: `color.js` (conversions, luminance, contrast), `scale.js` (tonal scales) and `build-palette.js` (the whole palette, plus a contrast report).
