import type { CSSProperties } from 'react';
import type { Book, FilterTab, SortKey } from '../types';
import './Toolbar.css';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'read', label: 'Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'want', label: 'Want to read' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'shelf', label: 'Shelf order' },
  { key: 'rating', label: 'My rating' },
  { key: 'title', label: 'Title A–Z' },
  { key: 'year', label: 'Year published' },
];

interface Props {
  books: Book[];
  tab: FilterTab;
  onTab: (tab: FilterTab) => void;
  query: string;
  onQuery: (query: string) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
}

export function Toolbar({ books, tab, onTab, query, onQuery, sort, onSort }: Props) {
  const count = (key: FilterTab) => (key === 'all' ? books.length : books.filter((b) => b.status === key).length);

  return (
    <div className="toolbar">
      <div className="toolbar__tabs" role="group" aria-label="Filter by status">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="toolbar__tab"
            aria-pressed={tab === key}
            style={{ '--tab-color': `var(--status-${key})` } as CSSProperties}
            onClick={() => onTab(key)}
          >
            {`${label} ${count(key)}`}
          </button>
        ))}
      </div>
      <div className="toolbar__find">
        <input
          className="field toolbar__search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search title or author"
          aria-label="Search title or author"
        />
        <select
          className="field toolbar__sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          aria-label="Sort by"
        >
          {SORTS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
