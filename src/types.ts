export type Status = 'read' | 'reading' | 'want';
export type Binding = 'slate' | 'aqua' | 'umber' | 'lilac' | 'forest' | 'plum';
export type Texture = 'linen' | 'leather';
export type SelectionTheme = 'lilac' | 'plum' | 'slate' | 'aqua';
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;
export type FilterTab = 'all' | Status;
export type SortKey = 'shelf' | 'rating' | 'title' | 'year';

/** Where a catalog record came from. */
export type CatalogSource = 'openlibrary' | 'seed' | 'manual';

/**
 * A book in the abstract, shared by all its editions. Cached when first added
 * to the shelf and never refreshed.
 *
 * Ids: `ol:<work key>` (e.g. `ol:OL45883W`), `seed:<seed id>`, or a uuid for
 * manual entries.
 */
export interface Work {
  id: string;
  source: CatalogSource;
  /** Open Library work key, e.g. 'OL45883W'. */
  sourceId?: string;
  title: string;
  authors: string[];
  /** Negative for BC. */
  firstPublishYear?: number;
  /** Genres or subjects. */
  subjects: string[];
  description: string;
  /** ISO timestamp of when the record was cached. */
  fetchedAt: string;
}

/**
 * A specific printing of a work: what an ISBN identifies.
 *
 * Ids: `ol:<edition key>` (e.g. `ol:OL7353617M`), `seed:<seed id>`, or a uuid.
 */
export interface Edition {
  id: string;
  workId: string;
  source: CatalogSource;
  /** Open Library edition key, e.g. 'OL7353617M'. */
  sourceId?: string;
  /** Can differ from the work's title ("Moby Dick; or, The Whale"). */
  title: string;
  isbn13?: string;
  isbn10?: string;
  publishers: string[];
  /** Free text, as catalogs give it ("1992", "May 2003"). */
  publishDate?: string;
  pageCount?: number;
  /** e.g. 'Paperback'. */
  format?: string;
  /** Open Library cover id; not shown in the UI yet. */
  coverId?: number;
  fetchedAt: string;
}

/** The reader's own data for a book: everything they can change. */
export interface ShelfFields {
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

/** One book on the shelf. At most one entry per work. */
export interface ShelfEntry extends ShelfFields {
  /** Seed books keep their seed id; others get a uuid. */
  id: string;
  workId: string;
  /** The edition the reader owns or is reading. */
  editionId: string;
  /** ISO timestamp. Shelf order is by this. */
  addedAt: string;
  updatedAt: string;
}

/** What the UI renders: a shelf entry with its work and edition. */
export interface Book extends ShelfEntry {
  work: Work;
  edition: Edition;
}

/** The manual add form. */
export interface BookDraft {
  title: string;
  author: string;
  /** Comma-separated. */
  genres: string;
  synopsis: string;
  status: Status;
}
