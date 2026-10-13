import type { Book, FilterTab, SortKey } from '../types';

export function visibleBooks(books: Book[], tab: FilterTab, query: string, sort: SortKey): Book[] {
  const q = query.trim().toLowerCase();
  const v = books.filter(
    (b) =>
      (tab === 'all' || b.status === tab) &&
      (!q ||
        b.work.title.toLowerCase().includes(q) ||
        b.work.authors.some((a) => a.toLowerCase().includes(q))),
  );
  if (sort === 'rating') return v.sort((a, b) => b.rating - a.rating);
  if (sort === 'title') return v.sort((a, b) => a.work.title.localeCompare(b.work.title));
  // Unknown years sort last.
  if (sort === 'year')
    return v.sort((a, b) => (a.work.firstPublishYear ?? Infinity) - (b.work.firstPublishYear ?? Infinity));
  return v;
}
