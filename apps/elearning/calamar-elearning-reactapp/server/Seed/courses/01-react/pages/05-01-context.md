Passing props through many intermediate components that don't use them — **prop drilling** — gets tedious. **Context** lets a parent make a value available to its entire subtree.

## Three steps

```jsx
import { createContext, useContext, useState } from 'react';

// 1. create
const ThemeContext = createContext('light');

// 2. provide
function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}

// 3. use, at any depth
function Button({ children }) {
  const theme = useContext(ThemeContext);
  return <button className={`btn-${theme}`}>{children}</button>;
}
```

> In React 19 you render `<ThemeContext value={…}>` directly. In earlier versions write `<ThemeContext.Provider value={…}>`.

## Providing state and actions together

A common pattern is a custom provider component plus a custom hook:

```jsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);
```

## When to use context

Good candidates: the current user, theme, language, a shopping cart. Every component reading a context re-renders when its value changes, so don't put rapidly changing values that only a few components need into a big shared context. And before reaching for context, consider passing JSX as `children` — it often removes the drilling altogether.

See the attached `ThemeContext.jsx`.
