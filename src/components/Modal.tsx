import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import './Modal.css';

interface Props {
  /** Called on Esc, a click on the scrim, or the browser closing the dialog. */
  onClose: () => void;
  labelledBy?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * A modal <dialog> rendered as a full-viewport scrim. Opens on mount, traps
 * focus, and hands focus back to the opener on unmount. Mount it only while
 * the modal should be shown.
 */
export function Modal({ onClose, labelledBy, className, style, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useFocusTrap(ref);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const active = document.activeElement as HTMLElement | null;
    // StrictMode re-runs this effect; don't record focus inside the dialog as the opener.
    if (!dialog.contains(active)) opener.current = active;
    dialog.showModal();
    // Start on [data-autofocus] if present, else on the dialog itself so no button shows a ring.
    (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog).focus();
    return () => {
      dialog.close();
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={className ? `modal ${className}` : 'modal'}
      aria-labelledby={labelledBy}
      style={style}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Only react to the browser closing it (e.g. repeated Esc), not our own close() on unmount.
        if (!ref.current?.open) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
