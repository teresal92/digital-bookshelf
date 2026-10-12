import { useCallback, useMemo } from 'react';
import { SEED_BOOKS } from '../data/seedBooks';
import { defaultLook } from '../lib/book';
import type { Book, BookCatalog, BookDraft, BookPersonal } from '../types';
import { usePersistentState } from './usePersistentState';

const KEY = 'bookshelf-v2';

/** A book the reader added: its catalog facts plus its default look. */
type AddedBook = BookCatalog & Pick<BookPersonal, 'binding' | 'texture'>;

/**
 * The full library: sample books plus added ones, minus removed ones, with
 * the reader's personal edits layered on top. All of it persists.
 */
export function useLibrary() {
  const [added, setAdded] = usePersistentState<AddedBook[]>(`${KEY}-added`, []);
  const [removed, setRemoved] = usePersistentState<string[]>(`${KEY}-removed`, []);
  const [personal, setPersonal] = usePersistentState<Record<string, Partial<BookPersonal>>>(
    `${KEY}-personal`,
    {},
  );

  const books = useMemo<Book[]>(() => {
    const addedBooks: Book[] = added.map((b) => ({
      status: 'want',
      rating: 0,
      notes: '',
      dateRead: '',
      progress: 0,
      ...b,
    }));
    return [...SEED_BOOKS, ...addedBooks]
      .filter((b) => !removed.includes(b.id))
      .map((b) => ({ ...b, ...personal[b.id] }));
  }, [added, removed, personal]);

  const updateBook = useCallback(
    (id: string, patch: Partial<BookPersonal>) =>
      setPersonal((p) => ({ ...p, [id]: { ...p[id], ...patch } })),
    [setPersonal],
  );

  /** Adds a book and returns its id. */
  const addBook = useCallback(
    (draft: BookDraft): string => {
      const id = crypto.randomUUID();
      const title = draft.title.trim();
      const { spineWidth, spineHeight, binding, texture } = defaultLook(
        title,
        SEED_BOOKS.length + added.length,
      );
      setAdded((a) => [
        ...a,
        {
          id,
          title,
          author: draft.author.trim(),
          year: new Date().getFullYear(),
          genres: draft.genres
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          synopsis: draft.synopsis.trim(),
          quote: '',
          spineWidth,
          spineHeight,
          binding,
          texture,
        },
      ]);
      setPersonal((p) => ({ ...p, [id]: { status: draft.status } }));
      return id;
    },
    [added.length, setAdded, setPersonal],
  );

  const removeBook = useCallback(
    (id: string) => {
      if (added.some((b) => b.id === id)) {
        setAdded((a) => a.filter((b) => b.id !== id));
        setPersonal(({ [id]: _, ...rest }) => rest);
      } else {
        setRemoved((r) => [...r, id]);
      }
    },
    [added, setAdded, setPersonal, setRemoved],
  );

  return { books, updateBook, addBook, removeBook };
}
