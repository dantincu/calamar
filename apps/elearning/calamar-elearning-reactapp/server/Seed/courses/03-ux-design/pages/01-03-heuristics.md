# Usability heuristics

Jakob Nielsen's ten heuristics (1994, still current) are a checklist for a **heuristic evaluation**: a few evaluators go through the interface on their own and note every violation, then merge their lists.

1. **Visibility of system status.** Always show what is happening: progress, saved/unsaved state, the current step.
2. **Match between the system and the real world.** Use the users' words and familiar conventions, not internal jargon.
3. **User control and freedom.** Provide clear exits: undo, cancel, back.
4. **Consistency and standards.** The same thing should look and behave the same everywhere, and follow platform conventions.
5. **Error prevention.** Better than a good error message is a design that makes the error impossible: constraints, sensible defaults, confirmation for destructive actions.
6. **Recognition rather than recall.** Show options instead of making people remember them.
7. **Flexibility and efficiency of use.** Offer shortcuts for experts that don't get in the way of novices.
8. **Aesthetic and minimalist design.** Every extra element competes with the relevant ones.
9. **Help users recognize, diagnose and recover from errors.** Error messages should be in plain language, say exactly what went wrong, and suggest a fix.
10. **Help and documentation.** Ideally unnecessary, but when needed, easy to search and focused on tasks.

## Rating what you find

Rate each problem's severity so the team fixes the right things first:

| Severity | Meaning |
|---|---|
| 0 | not a usability problem |
| 1 | cosmetic: fix if there is time |
| 2 | minor: low priority |
| 3 | major: important to fix |
| 4 | catastrophe: must fix before release |

## Color and the heuristics

Color touches several heuristics at once:

- **#1**: a status shown *only* by color (a green or red dot) is invisible to many users.
- **#4**: "primary" must be the same blue on every screen.
- **#9**: error states need more than red text: also an icon, a message and a place for the focus.

Keep these in mind for chapter 4.
