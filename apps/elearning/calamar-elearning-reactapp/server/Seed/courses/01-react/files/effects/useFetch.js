import { useEffect, useState } from 'react';

/**
 * Loads JSON from a URL and re-fetches when the URL changes.
 *   const { data, error, loading } = useFetch(`/api/items?page=${page}`);
 */
export function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: null, error, loading: false });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}
