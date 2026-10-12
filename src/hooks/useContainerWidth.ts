import { useCallback, useRef, useState } from 'react';

/**
 * Tracks an element's content width. Ignores changes of 4px or less so
 * scrollbar flicker doesn't reflow the shelves. Returns a callback ref.
 */
export function useContainerWidth<T extends HTMLElement>(fallback = 1200) {
  const [width, setWidth] = useState(fallback);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const apply = (w: number) => {
      const next = Math.round(w);
      setWidth((prev) => (Math.abs(next - prev) > 4 ? next : prev));
    };
    apply(el.getBoundingClientRect().width);
    observer.current = new ResizeObserver(([entry]) => {
      if (entry) apply(entry.contentRect.width);
    });
    observer.current.observe(el);
  }, []);

  return [ref, width] as const;
}
