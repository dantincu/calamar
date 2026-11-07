# Testing and documenting the palette

## Automated checks

1. **Token pairs**: `node build-palette.js --report` checks every promised pair in both themes and exits with code 1 if any fails, so it can run in CI.
2. **Rendered pages**: tools such as axe (in browser extensions, Playwright or Cypress) and Lighthouse compute the contrast of the text actually rendered, including inherited and composited colors.
3. **Visual regression**: screenshot tests in both themes catch a token that was changed by accident.

## Manual checks

- **Grayscale**: does the hierarchy still work? Can you tell success from error?
- **CVD emulation** in DevTools (previous lesson).
- **Real screens**: a cheap laptop panel in sunlight, a phone with reduced brightness, and a high-end screen. Very light tints (step 50 on white is 1.05:1) can disappear on poor screens. Never rely on them alone to separate areas: add a border.
- **Forced colors** (Windows contrast themes): the browser replaces your palette with the user's. Check that borders, focus rings and icons still show; use `@media (forced-colors: active)` for fixes.
- **Zoom and text size**: at 200%, large-text rules may start to apply to elements you designed as small.

## The demo page

`palette-demo.html` (attached) uses only semantic tokens: text, links, an input, buttons and alerts. Put it next to `palette.css` and open it in a browser. *Toggle theme* switches `data-theme`; nothing in the markup changes.

## Documenting

For each semantic token, document:

| Token | Use for | Don't use for | Pairs with |
|---|---|---|---|
| `color-primary` | the one primary action per view, selected states | decoration, large areas | `color-on-primary` |
| `color-text-muted` | secondary text: hints, timestamps, captions | placeholder-only labels, disabled text | `color-bg`, `color-surface` |
| `color-danger` | error icons and borders, destructive buttons | brand emphasis, "new" badges | `color-on-danger-soft` text on `color-danger-soft` |

The "pairs with" column documents the promises that the report checks, so the documentation and the tests say the same thing.

## A checklist

- [ ] Every text/background pair is ≥ 4.5:1 (≥ 3:1 for large text), in both themes
- [ ] Input borders, icons and focus rings are ≥ 3:1 against adjacent colors
- [ ] No information is conveyed by color alone
- [ ] Semantic colors aren't reused for decoration
- [ ] Hover and pressed states are visibly different ($\Delta E_{\text{OK}}$ well above 0.02)
- [ ] The palette is generated from a script, and the script's report runs in CI
