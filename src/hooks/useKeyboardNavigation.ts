import { useEffect, useEffectEvent } from 'react';

interface Options {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** ← / → step between items, except while typing in a field. */
export function useKeyboardNavigation({ enabled, onPrev, onNext }: Options) {
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  });

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
