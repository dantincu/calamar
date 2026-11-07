# Information architecture and user flows

**Information architecture (IA)** is how content and features are organized, labeled and found. Good IA is invisible: people find things where they expect them.

## Organizing

- **Inventory** everything the product contains.
- **Card sorting**: users group cards (one per item) and name the groups. In an *open* sort they invent the groups. In a *closed* sort they use yours, which validates a structure.
- **Tree testing**: users try to find items in a text-only version of your navigation tree. It tests the structure without any visual design getting in the way.

A rule of thumb for navigation: **broad and shallow** beats narrow and deep. Seven top-level sections with ten items each are easier to navigate than three levels of three.

## Labeling

Labels should use the words your users used in research. "Billing" or "Payments"? Ask them, or test both.

## User flows

A **user flow** is the path through screens and decisions needed to complete one task:

```
[Landing] -> (Has account?) --no--> [Sign up] -> [Verify e-mail] -> [Onboarding]
                           \--yes-> [Sign in] -------------------------> [Dashboard]
```

Drawing flows exposes problems early: dead ends, missing error paths ("what if the verification e-mail never arrives?"), and steps that could be removed.

## Counting steps

Every step loses some users. If each step keeps a share $p$ of the people who reach it, a flow of $n$ steps keeps

$$
P_{\text{complete}} = p^{\,n}
$$

With $p = 0.9$, five steps keep $0.9^5 \approx 59\%$ of users, and three steps keep $0.9^3 \approx 73\%$. Real funnels don't lose the same share at every step, but the lesson holds: **removing a step is worth more than polishing one**.
