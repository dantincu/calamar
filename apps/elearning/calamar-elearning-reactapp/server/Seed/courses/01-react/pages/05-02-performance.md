React is fast by default. Measure before optimizing — the **Profiler** tab of React Developer Tools shows which components render and how long they take. When you do find a slow spot, these are the tools.

## When does a component re-render?

1. Its state changed.
2. Its parent re-rendered (by default, all children render again).
3. A context it uses changed.

Re-rendering is usually cheap. It only becomes a problem for expensive components or very large lists.

## `memo`: skip rendering when props are equal

```jsx
import { memo } from 'react';

const Chart = memo(function Chart({ data }) {
  // expensive drawing…
});
```

`Chart` now only re-renders when `data` changes (compared with `Object.is`).

## `useMemo`: cache an expensive calculation

```jsx
const visible = useMemo(
  () => todos.filter((t) => matches(t, filter)),
  [todos, filter]
);
```

## `useCallback`: keep a function's identity

A new arrow function is created on every render, which defeats `memo` on a child receiving it:

```jsx
const handleSelect = useCallback((id) => setSelected(id), []);
<MemoizedList items={items} onSelect={handleSelect} />
```

## Other effective techniques

- **Move state down** into the component that actually uses it, so fewer components re-render.
- **Pass children** instead of rendering them inside a component that changes often.
- **Virtualize** long lists (e.g. `react-window`), rendering only visible rows.
- **Split code** with `lazy(() => import('./Settings'))` and `<Suspense>` so users download less JavaScript.

> The React Compiler can apply memoization automatically. In projects that use it you will write `memo`, `useMemo` and `useCallback` far less often — but understanding them helps you read existing code.
