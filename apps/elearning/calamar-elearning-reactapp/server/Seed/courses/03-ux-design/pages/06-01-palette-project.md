# Project: a palette for a task-tracking app

You are designing **Tasklane**, a small task tracker for teams. It has a task list, a task detail panel, a sign-in form and status badges (*to do*, *in progress*, *done*, *blocked*). Your job is its color system.

## 1. Gather the inputs

- Pick a brand color, or use the course's `#4f46e5`. Justify it in two sentences: associations, distinctiveness, no conflict with the status colors.
- Convert it to OKLCH (`rgbToOklch` in `color.js`) and write down $L_0$, $C_0$ and $h_0$.
- Pick the four semantic bases. Check that each is at least $\Delta E_{\text{OK}} \approx 0.1$ from the brand and from the others at the same step.

## 2. Generate the scales

Download all the files attached to this page into one folder and edit `BASES` in `build-palette.js`. Then run:

```bash
node build-palette.js > palette.css
node build-palette.js --report
```

Answer these questions:

1. On which step did your brand color land? Use $R = 1.05/(Y + 0.05)$ and the target table to explain why.
2. Which step of your warning scale is the first that passes 4.5:1 on white? What does it look like, and why?
3. Using only the target table, compute the contrast of `brand-800` text on a `brand-100` background. Check it with `contrastRatio`.

## 3. Map the status badges

Tasklane's statuses need a background, a text color and an icon each. Propose tokens such as `--color-status-blocked-bg`, map them to primitives in **both** themes, and add the pairs to `PAIRS` in `build-palette.js` so that the report checks them.

| Status | Icon | Light bg / text | Dark bg / text |
|---|---|---|---|
| To do | ○ | neutral-100 / neutral-800 | ? |
| In progress | ◐ | ? | ? |
| Done | ✓ | ? | ? |
| Blocked | ⛔ | ? | ? |

Make sure that *done* and *blocked* are distinguishable in a grayscale screenshot by something other than the icon. Hint: use different *steps*, not just different hues.

## 4. States

Define hover, pressed and focus for the primary button and for task rows. For each state that uses transparency, compute the composited color with $C = \alpha F + (1 - \alpha) B$ and its contrast with the text on it.

## 5. Check it

- `--report` passes in both themes.
- Open `palette-demo.html` next to your `palette.css`, and add your badges to it.
- Emulate deuteranopia and achromatopsia in DevTools. Can you still tell every status apart?
- Write the token documentation table (*Testing and documenting* lesson) for your status tokens.

## What you've built

You now have a palette that is:

- **perceptually even**, because it's built in OKLCH;
- **accessible by construction**, because each step is placed by contrast and the quotient rule tells you every pair in advance;
- **verified**, because the report checks every promise;
- **themeable**, because components only see semantic tokens.

Congratulations on finishing the course!
