# Dark mode

Dark mode is **a second mapping of the semantic tokens** onto the same scales. It's not an inverted light theme: inverting turns shadows into glows, makes saturated colors vibrate and flips images.

## The mapping

| Token | Light | Dark | Why |
|---|---|---|---|
| `color-bg` | neutral-50 | neutral-950 | |
| `color-surface` | white | neutral-900 | raised surfaces are *lighter* in dark mode |
| `color-text` | neutral-900 | neutral-50 | |
| `color-text-muted` | neutral-700 | neutral-300 | |
| `color-border-strong` | neutral-500 | neutral-500 | 3:1 on both dark backgrounds |
| `color-primary` | brand-600 | brand-400 | lighter, so it stands out on dark |
| `color-on-primary` | white | neutral-950 | dark text on a light-ish button |
| `color-*-soft` | step 50 | step 900 | tinted backgrounds are dark tints |
| `on-*-soft` | step 800 | step 200 | |

## The contrast still follows from the targets

The quotient rule works in dark mode too. For example:

$$
\mathrm{CR}(\text{neutral-50}, \text{neutral-950}) = \frac{14.5}{1.05} \approx 13.8, \qquad
\mathrm{CR}(\text{brand-400}, \text{neutral-950}) = \frac{14.5}{2.4} \approx 6.0
$$

so `color-on-primary` (neutral-950) on `color-primary` (brand-400) has 6.0:1. All the dark pairs are in the `--report` output.

## Elevation

In light mode, shadows show elevation. On a dark background shadows barely show, so **higher surfaces are lighter**: page at neutral-950, cards at neutral-900, menus and dialogs a step lighter again. You can also lighten a surface by overlaying white at a low opacity. The compositing formula in the next lesson gives the exact result: 8% white over `#28292f` gives `#393a40`.

## Why not pure black?

`#000000` backgrounds maximize contrast, and on OLED screens they turn pixels off. But pure white text on pure black (21:1) can look harsh and smear when scrolling, and there is no room left for "darker than the background" (shadows, wells). A very dark neutral (neutral-950 here, $Y \approx 0.022$) is the usual choice. The exception is media apps, where true black around video is the point.

## Saturation

Saturated colors on dark backgrounds appear to glow and vibrate. That's why the dark theme uses lighter, less chromatic steps (400 instead of 600) for the brand and semantic colors. The chroma taper in `scale.js` does part of this automatically.

## Wiring it up

```css
:root, [data-theme="light"] { color-scheme: light; /* light tokens */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { color-scheme: dark; /* dark tokens */ }
}

[data-theme="dark"] { color-scheme: dark; /* dark tokens */ }
```

- With no attribute, the theme follows the operating system.
- `data-theme` on `<html>` lets the user override it. Store the choice and apply it before first paint, to avoid a flash of the wrong theme.
- `color-scheme` tells the browser to draw scrollbars, form controls and the default canvas in the matching theme.
