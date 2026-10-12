import type { Book, FilterTab, SortKey } from '../types';

export function visibleBooks(books: Book[], tab: FilterTab, query: string, sort: SortKey): Book[] {
  const q = query.trim().toLowerCase();
  const v = books.filter(
    (b) =>
      (tab === 'all' || b.status === tab) &&
      (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
  );
  if (sort === 'rating') return v.sort((a, b) => b.rating - a.rating);
  if (sort === 'title') return v.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'year') return v.sort((a, b) => a.year - b.year);
  return v;
}
