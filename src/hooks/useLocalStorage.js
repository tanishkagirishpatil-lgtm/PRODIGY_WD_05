import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const read = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [stored, setStored] = useState(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      /* ignore quota errors */
    }
  }, [key, stored]);

  return [stored, setStored];
}
