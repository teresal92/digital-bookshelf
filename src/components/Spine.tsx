import { bindingColors, textureImage } from '../lib/book';
import type { SpineMetrics } from '../lib/shelfLayout';
import type { Book } from '../types';
import './Spine.css';

interface Props {
  book: Book;
  metrics: SpineMetrics;
  surnameFontSize: number;
  showAuthors: boolean;
  open: boolean;
  onOpen: (id: string) => void;
}

/** A cloth or leather spine: initials, title, surname, and a progress ribbon while reading. */
export function Spine({ book, metrics: m, surnameFontSize, showAuthors, open, onOpen }: Props) {
  const { bg, ink } = bindingColors(book.binding);
  const tip = `${book.title} — ${book.author}`;

  return (
    <button
      type="button"
      className={open ? 'spine spine--open' : 'spine'}
      title={tip}
      aria-label={tip}
      style={{
        width: m.width,
        height: m.height,
        backgroundColor: bg,
        backgroundImage: textureImage(book.texture),
        color: ink,
      }}
      onClick={() => onOpen(book.id)}
    >
      {book.status === 'reading' && (
        <div className="spine__ribbon" style={{ top: Math.round(m.height * (1 - book.progress / 100)) }} />
      )}
      {showAuthors && (
        <div className="spine__initials" style={{ fontSize: m.initialsFontSize }}>
          {m.initials}
        </div>
      )}
      <div className="spine__title" style={{ fontSize: m.titleFontSize, maxHeight: m.titleMaxHeight }}>
        {book.title}
      </div>
      {showAuthors && (
        <div className="spine__surname" style={{ fontSize: surnameFontSize }}>
          {m.surname}
        </div>
      )}
    </button>
  );
}
