import { useEffect, useState } from 'react';

/**
 * Like useState, but the value survives page reloads.
 *   const [name, setName] = useLocalStorage('name', '');
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue; // private mode, corrupted value, …
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
