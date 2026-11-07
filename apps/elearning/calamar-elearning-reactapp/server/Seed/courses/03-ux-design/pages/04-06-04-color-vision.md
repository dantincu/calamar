# Color vision deficiencies

About **8% of men and 0.5% of women** (of Northern European ancestry; less in other populations) have a color vision deficiency (CVD). In a product with 10,000 users, that's hundreds of people.

## The types

Normal color vision uses three kinds of cones, sensitive to long (L, "red"), medium (M, "green") and short (S, "blue") wavelengths. A CVD shifts or removes one kind:

| Type | Affected cones | Prevalence (men) | Confuses |
|---|---|---|---|
| Deuteranomaly / deuteranopia | M | ≈ 5% / 1% | red–green, especially at similar lightness |
| Protanomaly / protanopia | L | ≈ 1% / 1% | red–green; reds also look darker |
| Tritanomaly / tritanopia | S | rare (≈ 0.01%) | blue–yellow |
| Achromatopsia | all | very rare | everything: sees only lightness |

## The model behind simulators

Simulators work in a cone space like the LMS space of the OKLab lesson. A dichromat, missing one cone type, perceives the colors that differ only along that cone's axis as the same. Simulation is therefore a linear map on linearized RGB:

$$
\begin{pmatrix} R \\ G \\ B \end{pmatrix}_{\text{simulated}} = M_{\text{type}} \begin{pmatrix} R \\ G \\ B \end{pmatrix}_{\text{linear}}
$$

where $M_{\text{type}}$ projects out the missing dimension (published by Brettel, Viénot and Mollon, and by Machado and colleagues). For design work, the takeaway is this: **what survives every projection is lightness.** Two colors that differ in luminance stay distinguishable for every type of CVD, but two that differ only in hue may not.

## Rules

1. **Never use color as the only signal** (WCAG 1.4.1). Add icons, text, patterns or position. This is the semantic-colors rule again.
2. **Encode important differences in lightness.** In a chart, use steps that are far apart (300, 600 and 900) rather than four hues at step 500.
3. **Be careful with red/green pairs**, the classic "up/down" or "pass/fail". If you need them, make them different in lightness too, and add ▲▼ or ✓✕.
4. **Links in text** must differ from the surrounding text by more than color: underline them, or give them 3:1 against the body text color as well as 4.5:1 against the background.
5. **Charts:** label lines directly instead of relying on a color legend. Use dashes and markers. Choose palettes designed to be CVD-safe.

## Test it

- **Chrome and Edge DevTools**: *Rendering → Emulate vision deficiencies* (blurred vision, protanopia, deuteranopia, tritanopia and achromatopsia).
- **Firefox DevTools**: *Accessibility → Simulate*.
- **Grayscale screenshot**: the quickest test of all. If the screen still works in grayscale, it works for every CVD.

## In this course's palette

`success-600` and `danger-600` have the same luminance (0.179). In grayscale they're identical. That's why the alerts in `palette-demo.html` have a **bold label** ("Saved.", "Payment failed.") and a border, not just a tint.
