export type Status = 'read' | 'reading' | 'want';
export type Binding = 'slate' | 'aqua' | 'umber' | 'lilac' | 'forest' | 'plum';
export type Texture = 'linen' | 'leather';
export type SelectionTheme = 'lilac' | 'plum' | 'slate' | 'aqua';
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;
export type FilterTab = 'all' | Status;
export type SortKey = 'shelf' | 'rating' | 'title' | 'year';

/** Fixed facts about a book. Never changes after the book is created. */
export interface BookCatalog {
  id: string;
  title: string;
  author: string;
  /** Negative for BC. */
  year: number;
  genres: string[];
  synopsis: string;
  quote: string;
  /** Unscaled spine size in px. */
  spineWidth: number;
  spineHeight: number;
}

/** The reader's own data for a book; persisted per book id. */
export interface BookPersonal {
  status: Status;
  rating: Rating;
  notes: string;
  /** ISO date (yyyy-mm-dd) or ''. */
  dateRead: string;
  /** 0–100 */
  progress: number;
  binding: Binding;
  texture: Texture;
}

export type Book = BookCatalog & BookPersonal;

export interface BookDraft {
  title: string;
  author: string;
  /** Comma-separated. */
  genres: string;
  synopsis: string;
  status: Status;
}
