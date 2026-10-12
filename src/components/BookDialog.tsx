import { useId, type CSSProperties } from 'react';
import { useTransientFlag } from '../hooks/useTransientFlag';
import {
  BINDINGS,
  RATING_LABELS,
  SELECTION_THEMES,
  STATUS_LABELS,
  TEXTURES,
  bindingColors,
  lastName,
  markFor,
  textureImage,
  today,
} from '../lib/book';
import type { Book, BookPersonal, Rating, SelectionTheme, Status } from '../types';
import { Modal } from './Modal';
import './BookDialog.css';

const STATUSES: Status[] = ['read', 'reading', 'want'];
const STARS: Rating[] = [1, 2, 3, 4, 5];

interface Props {
  book: Book;
  /** Scrim faded in. */
  scrimShown: boolean;
  /** Card, cover and details in their final position. */
  revealed: boolean;
  highlightQuotes: boolean;
  selectionTheme: SelectionTheme;
  onSelectionTheme: (theme: SelectionTheme) => void;
  onUpdate: (patch: Partial<BookPersonal>) => void;
  onRemove: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

/** The open book: flipped-in cover, details, and the reader's own notes. */
export function BookDialog({
  book,
  scrimShown,
  revealed,
  highlightQuotes,
  selectionTheme,
  onSelectionTheme,
  onUpdate,
  onRemove,
  onPrev,
  onNext,
  onClose,
}: Props) {
  const titleId = useId();
  const [saved, flashSaved] = useTransientFlag(1400);
  const update = (patch: Partial<BookPersonal>) => {
    onUpdate(patch);
    flashSaved();
  };

  const { bg, ink } = bindingColors(book.binding);
  const surname = lastName(book.author);
  const coverAuthorSize = surname.length > 9 ? 36 : surname.length > 6 ? 44 : 54;

  return (
    <Modal
      className={scrimShown ? 'book-modal book-modal--scrim' : 'book-modal'}
      labelledBy={titleId}
      onClose={onClose}
    >
      <div className={revealed ? 'book sheet book--revealed' : 'book sheet'} data-sel={selectionTheme}>
        <button type="button" className="btn-close" aria-label="Close" title="Close (Esc)" onClick={onClose}>
          ×
        </button>
        <div className="book__scroll">
          <div className="book__aside">
            <div
              className="cover"
              aria-hidden="true"
              style={{ backgroundColor: bg, backgroundImage: textureImage(book.texture), color: ink }}
            >
              <div className="cover__author" style={{ fontSize: coverAuthorSize }}>
                {surname}
              </div>
              <div className="cover__window" />
              <div className="cover__title">{book.title}</div>
            </div>
            <div className="book__pager">
              <button type="button" className="btn-secondary" onClick={onPrev}>
                ← Prev
              </button>
              <button type="button" className="btn-secondary" onClick={onNext}>
                Next →
              </button>
            </div>
            <div className="book__look">
              <div className="label book__look-label">Binding</div>
              <div className="swatches">
                {BINDINGS.map(({ key, label }) => {
                  const c = bindingColors(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className="swatch"
                      aria-label={label}
                      aria-pressed={book.binding === key}
                      title={label}
                      style={{ '--swatch-bg': c.bg, '--swatch-ink': c.ink } as CSSProperties}
                      onClick={() => update({ binding: key })}
                    />
                  );
                })}
              </div>
              <div className="textures">
                {TEXTURES.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className="chip"
                    aria-pressed={book.texture === key}
                    onClick={() => update({ texture: key })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="label book__look-label book__look-label--highlight">Highlight</div>
              <div className="swatches">
                {SELECTION_THEMES.map(({ key, label }, i) => (
                  <button
                    key={key}
                    type="button"
                    className="hl-swatch"
                    aria-label={`${label} highlight`}
                    aria-pressed={selectionTheme === key}
                    title={label}
                    style={
                      {
                        '--swatch-bg': `var(--selection-${i + 1}-bg)`,
                        '--swatch-ink': `var(--selection-${i + 1}-fg)`,
                      } as CSSProperties
                    }
                    onClick={() => onSelectionTheme(key)}
                  >
                    Aa
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="book__body">
            <div className="book__statuses">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip chip--status"
                  aria-pressed={book.status === s}
                  onClick={() => update({ status: s })}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <h2 id={titleId} className="book__title">
              {book.title}
            </h2>
            <div className="book__byline">
              <span className="book__by">BY</span>
              <span className="book__author">{book.author}</span>
            </div>
            <div className="book__tags">
              {book.genres.map((g) => (
                <span key={g} className="book__tag" style={{ background: markFor(g) }}>
                  {g}
                </span>
              ))}
            </div>
            <p className="book__synopsis">{book.synopsis}</p>
            {book.quote && (
              <blockquote className="book__quote">
                “
                <span
                  className="book__quote-mark"
                  style={{ background: highlightQuotes ? markFor(book.title) : 'transparent' }}
                >
                  {book.quote}
                </span>
                ”
              </blockquote>
            )}

            <div className="book__rule" />

            <div className="book__meta">
              <div>
                <div className="label book__meta-label">My rating</div>
                <div className="stars">
                  {STARS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n <= book.rating ? 'star star--filled' : 'star'}
                      aria-label={`${n} stars`}
                      aria-pressed={book.rating === n}
                      onClick={() => update({ rating: book.rating === n ? 0 : n })}
                    >
                      ★
                    </button>
                  ))}
                  <span className="stars__label">{RATING_LABELS[book.rating]}</span>
                </div>
              </div>
              {book.status === 'reading' ? (
                <div className="progress">
                  <div className="progress__head">
                    <div className="label">Progress</div>
                    <div className="progress__value">{book.progress}%</div>
                  </div>
                  <div className="progress__control">
                    <div className="progress__track">
                      <div className="progress__fill" style={{ width: `${book.progress}%` }} />
                    </div>
                    <input
                      className="progress__input"
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={book.progress}
                      aria-label="Reading progress"
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        update(
                          p >= 100
                            ? { progress: 100, status: 'read', dateRead: book.dateRead || today() }
                            : { progress: p },
                        );
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="label book__meta-label">Finished</div>
                  <input
                    className="field book__date"
                    type="date"
                    value={book.dateRead}
                    aria-label="Finished"
                    onChange={(e) => update({ dateRead: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="notes">
              <div className="notes__head">
                <div className="label">My notes</div>
                <div className="notes__saved" aria-live="polite">
                  {saved ? 'Saved' : ''}
                </div>
              </div>
              <textarea
                className="notes__input"
                rows={5}
                value={book.notes}
                aria-label="My notes"
                placeholder="No notes yet. Jot down thoughts, favorite passages, who to lend it to…"
                onChange={(e) => update({ notes: e.target.value })}
              />
            </div>
            <div className="book__footer">
              <RemoveButton key={book.id} onRemove={onRemove} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Asks for a second click within 3 seconds. Keyed per book so stepping resets it. */
function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const [confirming, askConfirm] = useTransientFlag(3000);
  return (
    <button
      type="button"
      className={confirming ? 'remove remove--confirm' : 'remove'}
      onClick={confirming ? onRemove : askConfirm}
    >
      {confirming ? 'Click again to remove' : 'Remove from shelf'}
    </button>
  );
}
