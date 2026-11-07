# Neutrals

Neutrals cover most of the screen: page background, cards, text, borders and dividers. They decide whether an interface feels calm or noisy far more than the brand color does.

## Pure or tinted?

A pure gray has $C = 0$. Next to a saturated brand color, pure grays can look slightly dead, or even tinted with the complementary hue (simultaneous contrast). A common fix is to **tint the neutrals with the brand hue** at a very low chroma, around $C \approx 0.01$. That is far too little to look colored, but enough to look related.

`neutralScale(hue, 0.012)` in `scale.js` builds them with the same contrast targets as every other scale.

## Lightness of a gray

For a pure gray, OKLab lightness is the cube root of luminance (OKLCH lesson), and luminance is fixed by the target contrast. So each neutral step can be computed by hand:

$$
L_s = \sqrt[3]{Y_s} = \sqrt[3]{\frac{1.05}{R_s} - 0.05}
$$

For step 600 ($R = 4.6$): $Y = 1.05/4.6 - 0.05 = 0.178$, so $L = \sqrt[3]{0.178} \approx 0.563$. The generated tinted neutral is `#73757d`, at OKLCH $L = 56.3\%$.

## Indigo-tinted neutrals for `#4f46e5`

| Step | Hex | Typical use (light theme) |
|---|---|---|
| 50 | `#f8f9ff` | page background |
| 100 | `#edeff8` | hover background of list rows |
| 200 | `#dcdde6` | dividers, card borders (decorative) |
| 300 | `#c4c6cf` | disabled text and borders |
| 400 | `#a5a7af` | placeholder icons (decorative) |
| 500 | `#8c8d95` | **input borders**: 3.3:1, passes 1.4.11 |
| 600 | `#73757d` | secondary text on white only |
| 700 | `#5f6168` | **muted text**: passes on white *and* on step 50 |
| 800 | `#4b4c54` | strong secondary text |
| 900 | `#383940` | **body text** |
| 950 | `#28292f` | headings; the dark-theme background |

## Don't overdo the steps

You will use about six neutral steps per theme. The others exist so that dark mode (where the roles flip) and edge cases (a selected row inside a hover row) have somewhere to go.

## Placeholder text is still text

Placeholder text is *not* exempt from contrast rules: if it's there, people have to read it. The neutral-400 placeholder found in many designs (2.4:1) fails. Use 600 or darker, or better, put hints in a label or in help text that stays visible.
