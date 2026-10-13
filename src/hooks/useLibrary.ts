import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { library } from '../db/library';
import type { Book, BookDraft, ShelfFields } from '../types';

type Pending = Record<string, Partial<ShelfFields>>;

function reportError(err: unknown) {
  console.error('Library: save failed', err);
}

/** Drops pending fields the database has caught up with. Same object if nothing changed. */
function settle(pending: Pending, stored: Book[]): Pending {
  let changed = false;
  const next: Pending = {};
  for (const [id, patch] of Object.entries(pending)) {
    const book = stored.find((b) => b.id === id);
    const left = Object.entries(patch).filter(([k, v]) => book && book[k as keyof ShelfFields] !== v);
    if (left.length !== Object.keys(patch).length) changed = true;
    if (left.length) next[id] = Object.fromEntries(left);
  }
  return changed ? next : pending;
}

/**
 * The shelf, live from the local database. `books` is undefined until the
 * first read finishes.
 *
 * Edits show immediately: they sit in `pending` until the database reflects
 * them, so controlled inputs (notes) never flicker back to a stale value.
 */
export function useLibrary() {
  const stored = useLiveQuery(() => library.list(), []);
  const [pending, setPending] = useState<Pending>({});

  useEffect(() => {
    if (stored) setPending((p) => settle(p, stored));
  }, [stored]);

  const books = useMemo(
    () => stored?.map((b) => (pending[b.id] ? { ...b, ...pending[b.id] } : b)),
    [stored, pending],
  );

  const updateBook = useCallback((id: string, patch: Partial<ShelfFields>) => {
    setPending((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
    library.update(id, patch).catch(reportError);
  }, []);

  /** Adds a hand-typed book and resolves to its id. */
  const addBook = useCallback(async (draft: BookDraft) => (await library.addManual(draft)).id, []);

  const removeBook = useCallback((id: string) => {
    library.remove(id).catch(reportError);
  }, []);

  return { books, updateBook, addBook, removeBook };
}
