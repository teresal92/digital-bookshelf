import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** useState backed by localStorage (JSON). Storage failures are ignored. */
export function usePersistentState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode or quota: keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
