# Usability testing

In a usability test, a representative user tries to complete realistic tasks with your design while you watch.

## Running a session

1. **Recruit** people who match your users. Colleagues are not your users.
2. **Write tasks as goals**, not instructions: "You want to get a refund for your last order" rather than "Click *Orders*, then *Refund*". Don't use the words that appear on the screen.
3. **Ask them to think aloud**, and stay neutral. When they ask "should I click this?", answer "what would you do if I weren't here?"
4. **Watch what they do**, not just what they say. People blame themselves for the design's mistakes ("I'm just bad with computers").
5. **Debrief**: ask what was hardest and what they expected to find.

Remote unmoderated tests (with recording tools) scale better, but moderated sessions let you ask *why*.

## How many users?

Nielsen and Landauer (1993) modeled the share of problems found as each new user independently reveals a share $\lambda$ of all the problems:

$$
\text{found}(n) = 1 - (1 - \lambda)^{n}
$$

Across their projects the average was $\lambda \approx 0.31$:

| Users $n$ | 1 | 3 | 5 | 10 | 15 |
|---|---|---|---|---|---|
| Problems found | 31% | 67% | 84% | 97.6% | 99.6% |

From that curve comes the famous advice: **test with about five users, fix what you found, and test again**. Three rounds of five find more than one round of fifteen, because each round tests a better design and surfaces problems that the earlier ones were hiding.

## The fine print

- $\lambda$ varies a lot. Complex products, diverse users and rare problems give smaller values, and with $\lambda = 0.1$, five users find only $1 - 0.9^5 \approx 41\%$.
- The model is **per user group**: test five people from *each* distinct group (for example, buyers and sellers).
- It is about *finding* problems (qualitative). To *measure* (how many succeed? how fast?), you need more users. See the next lesson.

`problemsFound(n, lambda)` in `ux-math.js` computes the curve.

## Testing colors with users

Color problems often show up in tests as hesitation: "Is this button disabled?" (a low-contrast primary), "Did it save?" (a status shown only by a color change), or "I didn't see the error" (red text far from the field). Note them like any other problem, then check them against the contrast rules of chapter 4.
