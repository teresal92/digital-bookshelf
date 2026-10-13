import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { spineSize } from '../lib/book';
import type { Book, Edition, Work } from '../types';
import { LibraryDB } from './db';
import { libraryRepo } from './library';

let n = 0;
function setup(legacy: Record<string, unknown> = {}) {
  const storage = { getItem: (k: string) => (k in legacy ? JSON.stringify(legacy[k]) : null) };
  const db = new LibraryDB(`test-${n++}`, storage);
  return { db, repo: libraryRepo(db) };
}

const work: Work = {
  id: 'ol:OL45883W',
  source: 'openlibrary',
  sourceId: 'OL45883W',
  title: 'The Left Hand of Darkness',
  authors: ['Ursula K. Le Guin'],
  firstPublishYear: 1969,
  subjects: ['Science fiction'],
  description: 'An envoy on the planet Gethen.',
  fetchedAt: '2026-10-12T00:00:00.000Z',
};
const edition: Edition = {
  id: 'ol:OL7353617M',
  workId: work.id,
  source: 'openlibrary',
  sourceId: 'OL7353617M',
  title: work.title,
  isbn13: '9780441478125',
  publishers: ['Ace'],
  pageCount: 304,
  fetchedAt: work.fetchedAt,
};

describe('first run', () => {
  it('seeds the sample library in order', async () => {
    const { repo } = setup();
    const books = await repo.list();
    expect(books).toHaveLength(26);
    expect(books[0]!.id).toBe('pride-and-prejudice');
    expect(books[0]!.work.authors).toEqual(['Jane Austen']);
    expect(books.at(-1)!.id).toBe('treasure-island');
  });

  it('imports the localStorage library', async () => {
    const { repo } = setup({
      'bookshelf-v2-removed': ['moby-dick'],
      'bookshelf-v2-personal': { frankenstein: { rating: 2, notes: 'Hm.' }, 'my-book': { status: 'reading' } },
      'bookshelf-v2-added': [
        {
          id: 'my-book',
          title: 'My Book',
          author: 'Me',
          year: 2026,
          genres: ['Memoir'],
          synopsis: 'About me.',
          spineWidth: 80,
          spineHeight: 400,
          binding: 'plum',
          texture: 'linen',
        },
      ],
    });
    const books = await repo.list();
    expect(books.find((b) => b.id === 'moby-dick')).toBeUndefined();
    expect(books.find((b) => b.id === 'frankenstein')).toMatchObject({ rating: 2, notes: 'Hm.' });
    const mine = books.at(-1)!;
    expect(mine).toMatchObject({ id: 'my-book', status: 'reading', binding: 'plum' });
    expect(mine.work).toMatchObject({ source: 'manual', title: 'My Book', authors: ['Me'], subjects: ['Memoir'] });
  });
});

describe('adding', () => {
  it('adds a catalog book once per work, and never overwrites the cache', async () => {
    const { db, repo } = setup();
    const first = await repo.addFromCatalog(work, edition, 'want');
    expect(first.alreadyOnShelf).toBe(false);

    const again = await repo.addFromCatalog({ ...work, title: 'Changed' }, edition, 'read');
    expect(again).toEqual({ id: first.id, alreadyOnShelf: true });
    expect((await db.works.get(work.id))!.title).toBe(work.title);

    const books = await repo.list();
    expect(books).toHaveLength(27);
    expect(books.at(-1)).toMatchObject({ id: first.id, status: 'want', edition: { isbn13: '9780441478125' } });
  });

  it('adds a hand-typed book', async () => {
    const { repo } = setup();
    const { id } = await repo.addManual({
      title: ' Notes ',
      author: 'Me',
      genres: 'Essay, , Memoir',
      synopsis: '',
      status: 'read',
    });
    const book = (await repo.list()).find((b) => b.id === id)!;
    expect(book.work).toMatchObject({ source: 'manual', title: 'Notes', subjects: ['Essay', 'Memoir'] });
  });
});

describe('editing and removing', () => {
  it('updates shelf fields', async () => {
    const { repo } = setup();
    await repo.update('emma', { rating: 5, notes: 'Yes' });
    expect((await repo.list()).find((b) => b.id === 'emma')).toMatchObject({ rating: 5, notes: 'Yes' });
  });

  it('keeps cached catalog rows but drops hand-typed ones', async () => {
    const { db, repo } = setup();
    const ol = await repo.addFromCatalog(work, edition, 'want');
    const manual = await repo.addManual({ title: 'X', author: 'Y', genres: '', synopsis: '', status: 'want' });
    const manualWorkId = (await db.shelf.get(manual.id))!.workId;

    await repo.remove(ol.id);
    await repo.remove(manual.id);

    expect(await db.works.get(work.id)).toBeDefined();
    expect(await db.works.get(manualWorkId)).toBeUndefined();
    expect(await db.editions.where('workId').equals(manualWorkId).count()).toBe(0);
  });
});

describe('spineSize', () => {
  const book = (pageCount?: number) => ({ work: { title: 'Any' }, edition: { pageCount } }) as Book;

  it('widens with page count, within bounds', () => {
    const widths = [50, 80, 300, 600, 1200, 3000].map((p) => spineSize(book(p)).width);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(widths[0]).toBe(66);
    expect(widths.at(-1)).toBe(99);
  });

  it('falls back to the title hash, and height never depends on pages', () => {
    const { width, height } = spineSize(book());
    expect(width).toBeGreaterThanOrEqual(66);
    expect(width).toBeLessThanOrEqual(99);
    expect(spineSize(book(500)).height).toBe(height);
  });
});
