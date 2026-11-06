import { useEffect, useState } from 'react';

// Uses the free test API at jsonplaceholder.typicode.com
export default function UserList() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    const url = 'https://jsonplaceholder.typicode.com/users' + (query ? `?username_like=${encodeURIComponent(query)}` : '');

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setUsers(data);
        setStatus('done');
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setStatus('error');
      });

    // A new query (or unmounting) cancels the request in flight.
    return () => controller.abort();
  }, [query]);

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <input placeholder="Filter by username…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p style={{ color: 'crimson' }}>Could not load users.</p>}
      {status === 'done' && (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <strong>{u.name}</strong> — {u.email}
            </li>
          ))}
          {users.length === 0 && <li>No matches.</li>}
        </ul>
      )}
    </div>
  );
}
