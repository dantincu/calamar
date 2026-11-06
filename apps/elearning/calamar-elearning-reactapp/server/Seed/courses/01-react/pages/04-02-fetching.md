Loading data from a server is the most common effect. A robust implementation handles three states — **loading**, **error** and **success** — and avoids *race conditions*.

## The basic pattern

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'done'

  useEffect(() => {
    let ignore = false;
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { if (!ignore) { setUsers(data); setStatus('done'); } })
      .catch(() => { if (!ignore) setStatus('error'); });
    return () => { ignore = true; };
  }, []);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <p>Could not load users.</p>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

## Why the `ignore` flag?

If the effect depends on a value (say a search query) the user can change it before the previous response arrives. Responses can come back **out of order**, and without the flag a slow, stale response could overwrite a newer one. The cleanup marks old requests as ignored. `AbortController` is an alternative that also cancels the network request:

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setResults)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [query]);
```

## In larger apps

Libraries such as **TanStack Query** or **SWR**, or the data loading of a framework (React Router, Next.js), add caching, deduplication and background refresh. Understanding the manual pattern first makes those tools much easier to use.

The attached `UserList.jsx` adds a search box with request cancellation.
