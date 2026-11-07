# Measuring usability

The ISO definition (chapter 1) names three measurable qualities: **effectiveness**, **efficiency** and **satisfaction**.

## Effectiveness: task success

The completion rate is the share of participants who complete a task: $\hat p = x / n$. With small samples, report an interval, not just the number. The **adjusted Wald** interval works well for small $n$:

$$
\tilde p = \frac{x + 2}{n + 4}, \qquad \tilde p \pm 1.96 \sqrt{\frac{\tilde p\,(1 - \tilde p)}{n + 4}}
$$

**Example.** 4 of 5 participants succeed. $\tilde p = 6/9 \approx 0.667$, and the margin is $1.96\sqrt{0.667 \times 0.333 / 9} \approx 0.31$, so the 95% interval runs from about **36% to 97%**. "80% success" from five users is really "somewhere between a third and nearly everyone". That's fine for finding problems, but not for promising numbers to stakeholders.

## Efficiency: time on task

Task times are skewed: a few people take much longer than the rest. Report the **median** or the **geometric mean**, $\left(\prod t_i\right)^{1/n}$, rather than the arithmetic mean, and compare designs on the same tasks.

## Satisfaction: the System Usability Scale

The SUS (John Brooke, 1986) is ten statements, each answered from 1 (strongly disagree) to 5 (strongly agree). They alternate between positive (odd items: "I found the system easy to use") and negative (even items: "I found the system unnecessarily complex"). The score is

$$
\text{SUS} = 2.5 \left( \sum_{i \text{ odd}} (a_i - 1) + \sum_{i \text{ even}} (5 - a_i) \right)
$$

which ranges from 0 to 100. **It is not a percentage**: the average across hundreds of studies is about **68**, so anything above that is above average, and above about 80 is excellent.

**Example.** The answers $(4, 2, 5, 1, 4, 2, 5, 2, 4, 1)$ give odd items $(3 + 4 + 3 + 4 + 3) = 17$ and even items $(3 + 4 + 3 + 3 + 4) = 17$, so $\text{SUS} = 2.5 \times 34 = 85$.

```js
import { susScore } from './ux-math.js';
susScore([4, 2, 5, 1, 4, 2, 5, 2, 4, 1]); // 85
```

## Comparing designs

To show that design B beats design A, test enough participants and use the right statistical test (a t-test on log task times, or a two-proportion test on completion rates). With live traffic, an **A/B test** measures the actual effect on a business metric. One warning: a color change that "wins" an A/B test (a louder button) can still fail accessibility, so run the contrast report on the winner too.
