# Building the palette

A complete palette for a web app usually has:

| Scale | Count | Used for |
|---|---|---|
| **Brand** (primary) | 1 | primary actions, links, focus, selected states |
| **Neutrals** | 1 | text, backgrounds, surfaces, borders: 80–90% of the pixels |
| **Semantic** | 4 | success, warning, danger, info |
| Accent (optional) | 0–2 | highlights, illustrations, charts |

Each scale has the same **steps**: 50, 100, 200 … 900, 950, from lightest to darkest. The same step number means the same contrast in every scale, so `danger-700` text works wherever `brand-700` text works.

This sub-chapter builds those scales:

1. Choosing the brand color and related hues.
2. Generating a tonal scale from one color, with steps placed by contrast.
3. Neutrals tinted with the brand hue.
4. Semantic colors, and the trap of equal luminance.
