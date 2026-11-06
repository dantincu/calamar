`useEffect` runs code **after** React has updated the screen, to synchronize your component with an external system.

```jsx
useEffect(() => {
  // setup: runs after render
  return () => {
    // cleanup: runs before the next setup and when the component unmounts
  };
}, [dependencies]);
```

## The dependency array

| You write | The effect runs |
|---|---|
| `useEffect(fn)` | after **every** render |
| `useEffect(fn, [])` | once, after the first render (mount) |
| `useEffect(fn, [a, b])` | after the first render and whenever `a` or `b` changed |

List **every** prop, state or value from the component body that the effect uses. The linter rule `react-hooks/exhaustive-deps` helps you.

## Example: a document title

```jsx
useEffect(() => {
  document.title = `${unread} unread messages`;
}, [unread]);
```

## Example: a timer that cleans up

```jsx
useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 1000);
  return () => clearInterval(id); // without this, timers pile up
}, []);
```

In development, `StrictMode` deliberately mounts, unmounts and remounts components once to reveal missing cleanups. If your effect breaks when run twice, it needs a cleanup.

## You might not need an effect

Effects are for *external* systems. Don't use them to:

- **compute derived data** — calculate it during render instead;
- **respond to user events** — put that code in the event handler.

```jsx
// ❌ an unnecessary effect and an extra render
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(first + ' ' + last), [first, last]);

// ✅ just compute it
const fullName = first + ' ' + last;
```

See the attached `Clock.jsx`.
