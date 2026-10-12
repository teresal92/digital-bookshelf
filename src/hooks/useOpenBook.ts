import { useCallback, useEffect, useRef, useState } from 'react';

/** Delay before the cover flips in and the details slide in after opening. */
const REVEAL_MS = 280;
/** How long the scrim and card take to leave before the dialog unmounts. */
const CLOSE_MS = 320;
/** Re-reveal delay when stepping to the previous/next book. */
const STEP_MS = 60;

interface State {
  id: string | null;
  /** Scrim faded in. */
  scrim: boolean;
  /** Card, cover and details in their final position. */
  revealed: boolean;
}

/**
 * Which book is open, and the animation stage of the dialog:
 *   open  → mount with scrim hidden, fade scrim in next frame, reveal at 280ms
 *   step  → swap book, hide details, re-reveal at 60ms
 *   close → hide scrim and details, unmount at 320ms
 */
export function useOpenBook() {
  const [state, setState] = useState<State>({ id: null, scrim: false, revealed: false });
  const timer = useRef<number | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const closing = useRef(false);

  const later = (ms: number, fn: () => void) => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const open = useCallback((id: string) => {
    closing.current = false;
    setState({ id, scrim: false, revealed: false });
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => setState((s) => ({ ...s, scrim: true })));
    });
    later(REVEAL_MS, () => setState((s) => ({ ...s, revealed: true })));
  }, []);

  const step = useCallback((id: string) => {
    if (closing.current) return;
    setState((s) => ({ ...s, id, revealed: false }));
    later(STEP_MS, () => setState((s) => ({ ...s, revealed: true })));
  }, []);

  /** `onClosed` runs once the dialog has finished leaving. */
  const close = useCallback((onClosed?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    if (frame.current) cancelAnimationFrame(frame.current);
    setState((s) => ({ ...s, scrim: false, revealed: false }));
    later(CLOSE_MS, () => {
      closing.current = false;
      setState({ id: null, scrim: false, revealed: false });
      onClosed?.();
    });
  }, []);

  return { ...state, open, step, close };
}
