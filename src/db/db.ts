import Dexie, { type EntityTable } from 'dexie';
import type { Edition, ShelfEntry, Work } from '../types';
import { initialRows } from './legacyImport';

/**
 * The local library database (IndexedDB).
 *
 * - `works` and `editions` are the catalog cache: written when a book is first
 *   added to the shelf, never refreshed.
 * - `shelf` is the reader's data. `workId` is unique: one entry per work.
 */
export class LibraryDB extends Dexie {
  works!: EntityTable<Work, 'id'>;
  editions!: EntityTable<Edition, 'id'>;
  shelf!: EntityTable<ShelfEntry, 'id'>;

  /** `legacyStorage` is read once, when the database is first created. */
  constructor(name = 'bookshelf', legacyStorage?: Pick<Storage, 'getItem'>) {
    super(name);
    this.version(1).stores({
      works: 'id',
      editions: 'id, workId, isbn13, isbn10',
      shelf: 'id, &workId, addedAt',
    });
    this.on('populate', (tx) => {
      const { works, editions, entries } = initialRows(legacyStorage);
      tx.table('works').bulkAdd(works);
      tx.table('editions').bulkAdd(editions);
      tx.table('shelf').bulkAdd(entries);
    });
  }
}

export const db = new LibraryDB('bookshelf', typeof localStorage === 'undefined' ? undefined : localStorage);
