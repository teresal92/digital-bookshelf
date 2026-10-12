import { packShelves, shelfMetrics, spineMetrics } from '../lib/shelfLayout';
import { useContainerWidth } from '../hooks/useContainerWidth';
import type { Book } from '../types';
import { Spine } from './Spine';
import './Shelves.css';

interface Props {
  books: Book[];
  bookSize: number;
  showAuthors: boolean;
  /** The book whose dialog is open; its spine lifts out of the row. */
  openId: string | null;
  onOpen: (id: string) => void;
  onAdd: () => void;
}

/** Full-width shelves; spines keep a fixed size and wrap onto new shelves. */
export function Shelves({ books, bookSize, showAuthors, openId, onOpen, onAdd }: Props) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const m = shelfMetrics(width, bookSize);
  const shelves = packShelves(books, width, m);

  return (
    <>
      <div ref={ref} className="shelves">
        {shelves.map((row, i) => (
          <div key={i}>
            <div className="shelf__row" style={{ gap: m.gap, height: m.shelfHeight }}>
              {i === 0 && (
                <button
                  type="button"
                  className="add-slot"
                  title="Add a book"
                  aria-label="Add a book"
                  style={{ width: m.slotWidth, height: m.slotHeight, marginRight: m.gap }}
                  onClick={onAdd}
                >
                  <span className="add-slot__plus">+</span>
                  <span className="add-slot__label">Add a book</span>
                </button>
              )}
              {row.map((b) => (
                <Spine
                  key={b.id}
                  book={b}
                  metrics={spineMetrics(b, m.scale, showAuthors)}
                  surnameFontSize={m.surnameFontSize}
                  showAuthors={showAuthors}
                  open={b.id === openId}
                  onOpen={onOpen}
                />
              ))}
            </div>
            <div className="shelf__plank" />
            <div className="shelf__underside" />
          </div>
        ))}
      </div>
      {books.length === 0 && <div className="shelves__empty">No books match that search.</div>}
    </>
  );
}
