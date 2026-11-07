# Spacing and grids

## A spacing scale

As with type, pick spacing from a scale instead of inventing values. The common **4/8 px system** uses multiples of 4:

```
4  8  12  16  24  32  48  64  96
```

The steps get further apart as they grow, because the difference between 4 and 8 px is obvious, while the difference between 60 and 64 px isn't. Combined with *proximity* (previous lesson), the rule is: **space inside a group is smaller than space between groups**.

## Layout grids

A column grid has $n$ columns, gutters of width $g$ between them, and outer margins $m$. Inside a container of width $W$:

$$
c = \frac{W - 2m - (n - 1)\,g}{n}
$$

For $W = 1200$, $n = 12$, $g = 24$ and $m = 32$: $c = (1200 - 64 - 264)/12 \approx 72.67\,\text{px}$. An element spanning $k$ columns is $k\,c + (k - 1)\,g$ wide.

Twelve columns are popular because 12 divides by 2, 3, 4 and 6, which allows halves, thirds, quarters and sixths. With CSS Grid you rarely compute $c$ yourself:

```css
.layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 24px;
  padding-inline: 32px;
}
.sidebar { grid-column: span 3; }
.content { grid-column: span 9; }
```

## Responsive behavior

Typical breakpoints switch from 4 columns (phones) to 8 (tablets) to 12 (desktops). Design the narrowest layout first: it forces you to decide what matters most.

## Density

Data-heavy apps (dashboards, admin tools) often offer *comfortable* and *compact* densities. If every spacing value is a token (`--space-2`, `--space-4`, …), a density switch just redefines the tokens. Chapter 4 does the same thing with color tokens and themes.
