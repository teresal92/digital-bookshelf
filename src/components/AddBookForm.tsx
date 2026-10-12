import { useId, useState, type FormEvent } from 'react';
import { STATUS_LABELS } from '../lib/book';
import type { BookDraft, Status } from '../types';
import { Modal } from './Modal';
import './AddBookForm.css';

const STATUSES: Status[] = ['want', 'reading', 'read'];
const EMPTY: BookDraft = { title: '', author: '', genres: '', synopsis: '', status: 'want' };

interface Props {
  onSave: (draft: BookDraft) => void;
  onCancel: () => void;
}

export function AddBookForm({ onSave, onCancel }: Props) {
  const headingId = useId();
  const [draft, setDraft] = useState<BookDraft>(EMPTY);
  const set = <K extends keyof BookDraft>(key: K, value: BookDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const canSave = Boolean(draft.title.trim() && draft.author.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canSave) onSave(draft);
  };

  return (
    <Modal labelledBy={headingId} onClose={onCancel}>
      <form className="add-form sheet" onSubmit={submit}>
        <button type="button" className="btn-close" aria-label="Close" title="Close (Esc)" onClick={onCancel}>
          ×
        </button>
        <div>
          <h2 id={headingId} className="add-form__heading">
            Add to the shelf
          </h2>
        </div>
        <label className="label add-form__field">
          Title
          <input
            className="field add-form__input"
            data-autofocus
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </label>
        <label className="label add-form__field">
          Author
          <input
            className="field add-form__input"
            value={draft.author}
            onChange={(e) => set('author', e.target.value)}
          />
        </label>
        <label className="label add-form__field">
          Genres
          <input
            className="field add-form__input"
            placeholder="Separate with commas"
            value={draft.genres}
            onChange={(e) => set('genres', e.target.value)}
          />
        </label>
        <label className="label add-form__field">
          Synopsis
          <textarea
            className="add-form__textarea"
            rows={3}
            value={draft.synopsis}
            onChange={(e) => set('synopsis', e.target.value)}
          />
        </label>
        <div className="add-form__field" role="group" aria-labelledby={`${headingId}-status`}>
          <div id={`${headingId}-status`} className="label">
            Status
          </div>
          <div className="add-form__statuses">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className="chip chip--status"
                aria-pressed={draft.status === s}
                onClick={() => set('status', s)}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="add-form__actions">
          <button type="button" className="btn-secondary add-form__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!canSave}>
            Add to shelf
          </button>
        </div>
      </form>
    </Modal>
  );
}
