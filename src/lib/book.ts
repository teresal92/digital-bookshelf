import type { Binding, Book, Rating, SelectionTheme, Status, Texture } from '../types';

/** Order matters: index + 1 is the --binding-{n} token slot. */
export const BINDINGS: { key: Binding; label: string }[] = [
  { key: 'slate', label: 'Slate' },
  { key: 'aqua', label: 'Aqua' },
  { key: 'umber', label: 'Umber' },
  { key: 'lilac', label: 'Lilac' },
  { key: 'forest', label: 'Forest' },
  { key: 'plum', label: 'Plum' },
];

/** Order matters: index + 1 is the --selection-{n} token slot. */
export const SELECTION_THEMES: { key: SelectionTheme; label: string }[] = [
  { key: 'lilac', label: 'Lilac' },
  { key: 'plum', label: 'Plum' },
  { key: 'slate', label: 'Slate' },
  { key: 'aqua', label: 'Aqua' },
];

export const TEXTURES: { key: Texture; label: string }[] = [
  { key: 'linen', label: 'Linen' },
  { key: 'leather', label: 'Leather' },
];

export const STATUS_LABELS: Record<Status, string> = {
  read: 'Read',
  reading: 'Reading',
  want: 'Want to read',
};

export const RATING_LABELS: Record<Rating, string> = {
  0: 'Not rated',
  1: "Didn't like it",
  2: 'It was okay',
  3: 'Liked it',
  4: 'Really liked it',
  5: 'Loved it',
};

export function bindingSlot(binding: Binding): number {
  return BINDINGS.findIndex((b) => b.key === binding) + 1;
}

export function bindingColors(binding: Binding) {
  const n = bindingSlot(binding);
  return { bg: `var(--binding-${n})`, ink: `var(--binding-${n}-ink)` };
}

export function textureImage(texture: Texture): string {
  return `var(--texture-${texture})`;
}

/** Deterministic string hash; drives each book's default look. */
export function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Highlighter color for a genre tag or quote, stable per string. */
export function markFor(text: string): string {
  return `var(--annotation-${(hash(text) % 5) + 1})`;
}

export function lastName(author: string): string {
  return author.split(' ').slice(-1)[0] ?? '';
}

export function initials(author: string): string {
  return author
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .slice(-2)
    .join('');
}

/**
 * Default binding and texture for a new shelf entry. `index` is the entry's
 * position on the shelf at creation time.
 */
export function defaultLook(title: string, index: number): { binding: Binding; texture: Texture } {
  const h = hash(title);
  return {
    binding: BINDINGS[(index * 5 + h) % BINDINGS.length]!.key,
    texture: (h >> 5) % 2 ? 'leather' : 'linen',
  };
}

const MIN_WIDTH = 66;
const MAX_WIDTH = 99;
const THIN_PAGES = 80;
const THICK_PAGES = 1200;

/**
 * Unscaled spine size in px. Never stored: width follows the edition's page
 * count (square-root scale, so mid-length books still differ), falling back
 * to a title hash; height is always the title hash.
 */
export function spineSize(book: Book): { width: number; height: number } {
  const h = hash(book.work.title);
  const pages = book.edition.pageCount;
  let width = MIN_WIDTH + (h % (MAX_WIDTH - MIN_WIDTH + 1));
  if (pages) {
    const t = (Math.sqrt(pages) - Math.sqrt(THIN_PAGES)) / (Math.sqrt(THICK_PAGES) - Math.sqrt(THIN_PAGES));
    width = Math.round(MIN_WIDTH + Math.min(1, Math.max(0, t)) * (MAX_WIDTH - MIN_WIDTH));
  }
  return { width, height: 370 + ((h >> 3) % 100) };
}

/** First author, or '' when the catalog has none. */
export function mainAuthor(book: Book): string {
  return book.work.authors[0] ?? '';
}

export function authorLine(book: Book): string {
  return book.work.authors.join(', ');
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
