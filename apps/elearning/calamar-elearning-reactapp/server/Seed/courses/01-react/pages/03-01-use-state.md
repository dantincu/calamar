A regular local variable is reset every time a component renders, and changing it doesn't trigger a new render. `useState` solves both problems.

## Declaring state

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

`useState(0)` returns a pair: the current value and a **setter**. Calling the setter stores a new value and asks React to render the component again.

## Rules of hooks

- Call hooks only **at the top level** of a component — never inside conditions, loops or nested functions.
- Call hooks only from **components or other hooks**.

React identifies each piece of state by the order of the hook calls, so this order must be the same on every render.

## State is a snapshot

Inside one render, `count` never changes. This surprises many people:

```jsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1); // still count + 1, not + 2!
}
```

When the next value depends on the previous one, pass an **updater function**:

```jsx
setCount((c) => c + 1);
setCount((c) => c + 1); // now +2
```

## Objects and arrays: replace, don't mutate

```jsx
const [user, setUser] = useState({ name: 'Ada', age: 36 });

// ❌ mutating: React won't notice
user.age = 37;

// ✅ create a new object
setUser({ ...user, age: 37 });

// arrays
setItems([...items, newItem]);                  // add
setItems(items.filter((i) => i.id !== id));     // remove
setItems(items.map((i) => (i.id === id ? { ...i, done: true } : i))); // update
```

The attached `Counter.jsx` shows a counter with step size and history.
