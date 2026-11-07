# Semantic colors

Semantic colors carry meaning that is almost universal in software:

| Role | Hue (OKLCH $h$) | Base used here | Used for |
|---|---|---|---|
| Success | about 145–150° (green) | `#16a34a` | completed, saved, valid |
| Warning | about 55–85° (amber) | `#d97706` | needs attention, can continue |
| Danger | about 25–30° (red) | `#dc2626` | errors, destructive actions |
| Info | about 230–245° (blue) | `#0284c7` | neutral announcements |

Each gets a full scale with the same contrast targets as the brand scale. A typical alert uses three steps: background 50, border or icon 600, and text 800.

## The trap: equal luminance

Contrast-placed scales have a consequence that is easy to miss. **The same step has the same luminance in every scale:**

| | `success-600` `#00883a` | `danger-600` `#e02d2b` |
|---|---|---|
| Luminance $Y$ | 0.1791 | 0.1790 |

In a grayscale screenshot those two are *identical*. For someone with red-green color blindness (about 1 man in 12), they differ only in a hue they may barely perceive. A form that marks valid fields green and invalid fields red, with no other signal, fails these users, and it fails WCAG criterion 1.4.1 (*Use of color*).

**Never let color be the only signal.** Pair every semantic color with:

- an **icon** (✓, ⚠, ✕, ℹ),
- **text** ("Saved", "Payment failed"),
- and, for errors, a **position**: next to the field, with `aria-describedby` linking the message to the field.

## Making semantic colors distinguishable anyway

Hue differences still help most users, so keep the semantic hues far apart from each other and from the brand:

$$
\Delta E_{\text{OK}}(\text{success-600}, \text{danger-600}) \approx 0.30, \qquad \Delta E_{\text{OK}}(\text{danger-600}, \text{warning-600}) \approx 0.12
$$

Red and amber are the closest pair. If your brand is orange or red, move warning towards yellow (h ≈ 85°) and use a different step for it, so that it also differs in lightness.

## Warning, the difficult one

Yellows and ambers are naturally light (OKLCH lesson). A warning-600 with 4.6:1 on white comes out as `#b26000`, a brownish orange, because a vivid amber can't be that dark. That's fine: use the vivid steps (300–500) for **backgrounds and icons**, and the dark steps for text. On a vivid amber background, use **dark text**, never white.

## Don't reuse semantic colors for other jobs

If "success green" also marks "online" users and "new" badges, people learn that green means many things, and success messages lose their meaning (the Gestalt principle of similarity). Give decorative uses their own accent scale.
