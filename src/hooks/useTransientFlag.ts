import { useCallback, useEffect, useRef, useState } from 'react';

/** A boolean that turns itself back off `ms` after the last `raise()`. */
export function useTransientFlag(ms: number) {
  const [on, setOn] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const raise = useCallback(() => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), ms);
  }, [ms]);

  return [on, raise] as const;
}
