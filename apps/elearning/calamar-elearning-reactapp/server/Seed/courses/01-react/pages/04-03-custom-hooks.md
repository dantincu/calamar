A **custom hook** is a function whose name starts with `use` and that calls other hooks. It lets you reuse *stateful logic* between components — not the state itself: each component calling the hook gets its own independent state.

## Extracting a hook

The online/offline indicator logic, used in several components:

```jsx
function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

function StatusBar() {
  const online = useOnlineStatus();
  return <p>{online ? '✅ Online' : '❌ Disconnected'}</p>;
}
```

## Good custom hooks

- Have a **clear, specific purpose**: `useLocalStorage`, `useFetch`, `useDebounce`, `useMediaQuery`.
- Return what the caller needs — a value, a pair like `useState`, or an object.
- Follow the rules of hooks themselves.

## Attached examples

- `useLocalStorage.js` — like `useState`, but persisted in the browser:

  ```jsx
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  ```

- `useFetch.js` — the fetching pattern of the previous page as a reusable hook:

  ```jsx
  const { data, error, loading } = useFetch('/api/products');
  ```

## Exercise

Write `useDebounce(value, delay)` that returns `value` only after it stopped changing for `delay` milliseconds. Use it to avoid sending a request on every keystroke in `UserList.jsx`.
