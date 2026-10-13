import { useMemo, useState } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useLibrary } from '../hooks/useLibrary';
import { useOpenBook } from '../hooks/useOpenBook';
import { usePersistentState } from '../hooks/usePersistentState';
import { visibleBooks } from '../lib/filter';
import type { BookDraft, FilterTab, SelectionTheme, SortKey } from '../types';
import { AddBookForm } from './AddBookForm';
import { BookDialog } from './BookDialog';
import { Shelves } from './Shelves';
import { Toolbar } from './Toolbar';
import './Library.css';

export interface LibraryProps {
  /** Spine scale, 0.7–1.3. */
  bookSize?: number;
  /** Initials and surnames on the spines. */
  showAuthors?: boolean;
  /** Text-selection color until the reader picks one. */
  selectionColor?: SelectionTheme;
}

export function Library({
  bookSize = 1,
  showAuthors = true,
  selectionColor = 'lilac',
}: LibraryProps) {
  const { books, updateBook, addBook, removeBook } = useLibrary();
  const [tab, setTab] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('shelf');
  const [adding, setAdding] = useState(false);
  const [selTheme, setSelTheme] = usePersistentState<SelectionTheme | null>('bookshelf-v2-sel', null);
  const openBook = useOpenBook();

  const visible = useMemo(() => visibleBooks(books, tab, query, sort), [books, tab, query, sort]);
  const selected = books.find((b) => b.id === openBook.id);

  const stepBy = (d: number) => {
    if (!visible.length) return;
    // The open book may no longer match the filter (e.g. just marked Read on the Reading
    // tab). Keep it in the sequence, in sort order, so Prev/Next land on its real neighbours.
    const shown = new Set(visible.map((b) => b.id));
    const sequence = visibleBooks(books, 'all', '', sort).filter(
      (b) => shown.has(b.id) || b.id === openBook.id,
    );
    const i = sequence.findIndex((b) => b.id === openBook.id);
    openBook.step(sequence[(i + d + sequence.length) % sequence.length]!.id);
  };
  useKeyboardNavigation({
    enabled: selected != null && !adding,
    onPrev: () => stepBy(-1),
    onNext: () => stepBy(1),
  });

  const handleAdd = (draft: BookDraft) => {
    const id = addBook(draft);
    setAdding(false);
    setTab('all');
    setQuery('');
    openBook.open(id);
  };

  // Remove after the dialog has faded so it never shows a missing book.
  const handleRemove = (id: string) => openBook.close(() => removeBook(id));

  return (
    <div className="library">
      <div className="library__page">
        <div className="library__inner">
          <header className="library__header">
            <h1 className="library__wordmark">My Library</h1>
            <Toolbar
              books={books}
              tab={tab}
              onTab={setTab}
              query={query}
              onQuery={setQuery}
              sort={sort}
              onSort={setSort}
            />
          </header>
          <Shelves
            books={visible}
            bookSize={bookSize}
            showAuthors={showAuthors}
            openId={openBook.id}
            onOpen={openBook.open}
            onAdd={() => setAdding(true)}
          />
        </div>
      </div>

      {selected && (
        <BookDialog
          book={selected}
          scrimShown={openBook.scrim}
          revealed={openBook.revealed}
          selectionTheme={selTheme ?? selectionColor}
          onSelectionTheme={setSelTheme}
          onUpdate={(patch) => updateBook(selected.id, patch)}
          onRemove={() => handleRemove(selected.id)}
          onPrev={() => stepBy(-1)}
          onNext={() => stepBy(1)}
          onClose={() => openBook.close()}
        />
      )}
      {adding && <AddBookForm onSave={handleAdd} onCancel={() => setAdding(false)} />}
    </div>
  );
}
