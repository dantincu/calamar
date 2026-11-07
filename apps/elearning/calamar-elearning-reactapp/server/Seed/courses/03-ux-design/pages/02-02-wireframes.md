# Wireframes and prototypes

## Fidelity

| | Low fidelity | Mid fidelity | High fidelity |
|---|---|---|---|
| Looks like | paper sketches, boxes | grayscale layouts with real content | the final visual design |
| Good for | exploring many ideas fast | structure, hierarchy, flows | visual details, stakeholder sign-off, developer handoff |
| Cost of throwing away | none | low | high |

Start low and go higher only once the structure stops changing. **Wireframes are grayscale on purpose**: color too early turns a structure review into a debate about brand blue.

## Wireframe rules

- Use **real content**, or realistic content. Lorem ipsum hides the long names, empty states and 40-word error messages that break layouts.
- Design the **states**, not just the screen: empty, loading, partial, error, and too much data.
- Annotate behavior that the picture can't show: "sorted by due date", "saves automatically".

## Prototypes

A prototype is anything people can interact with to test an idea: clickable wireframes, a Figma prototype, or a quick HTML page. Choose the cheapest prototype that can answer your question:

- *Can people find the export button?* Clickable wireframes are enough.
- *Does the drag-and-drop feel right?* You need real code.

## From prototype to palette

Mid-fidelity wireframes are the right moment to plan color **roles** (primary action, surfaces, text, status) without choosing any hues. In chapter 4 you will turn those roles into *semantic tokens* such as `--color-primary` and `--color-text-muted`, and only then fill them with values.
