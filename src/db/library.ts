import { defaultLook } from '../lib/book';
import type { Book, BookDraft, Edition, ShelfEntry, ShelfFields, Status, Work } from '../types';
import { db as defaultDb, type LibraryDB } from './db';

export interface AddResult {
  /** The shelf entry id: the new one, or the existing one for that work. */
  id: string;
  alreadyOnShelf: boolean;
}

/** Shelf operations. Each runs in its own transaction. */
export function libraryRepo(db: LibraryDB) {
  /** Every shelf entry in shelf order, joined with its work and edition. */
  async function list(): Promise<Book[]> {
    const entries = await db.shelf.orderBy('addedAt').toArray();
    const [works, editions] = await Promise.all([
      db.works.bulkGet(entries.map((e) => e.workId)),
      db.editions.bulkGet(entries.map((e) => e.editionId)),
    ]);
    return entries.flatMap((e, i) => {
      const work = works[i];
      const edition = editions[i];
      return work && edition ? [{ ...e, work, edition }] : [];
    });
  }

  /**
   * Puts a work on the shelf in the given edition. Cached catalog rows are
   * kept as they are, never overwritten.
   */
  function addFromCatalog(work: Work, edition: Edition, status: Status): Promise<AddResult> {
    return db.transaction('rw', db.works, db.editions, db.shelf, async () => {
      const existing = await db.shelf.where('workId').equals(work.id).first();
      if (existing) return { id: existing.id, alreadyOnShelf: true };

      if (!(await db.works.get(work.id))) await db.works.add(work);
      if (!(await db.editions.get(edition.id))) await db.editions.add(edition);

      const now = new Date().toISOString();
      const entry: ShelfEntry = {
        id: crypto.randomUUID(),
        workId: work.id,
        editionId: edition.id,
        status,
        rating: 0,
        notes: '',
        dateRead: '',
        progress: 0,
        ...defaultLook(work.title, await db.shelf.count()),
        addedAt: now,
        updatedAt: now,
      };
      await db.shelf.add(entry);
      return { id: entry.id, alreadyOnShelf: false };
    });
  }

  /** A book typed in by hand: its own work and edition. */
  function addManual(draft: BookDraft): Promise<AddResult> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const title = draft.title.trim();
    const author = draft.author.trim();
    return addFromCatalog(
      {
        id,
        source: 'manual',
        title,
        authors: author ? [author] : [],
        firstPublishYear: new Date().getFullYear(),
        subjects: draft.genres
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        description: draft.synopsis.trim(),
        fetchedAt: now,
      },
      { id, workId: id, source: 'manual', title, publishers: [], fetchedAt: now },
      draft.status,
    );
  }

  async function update(id: string, patch: Partial<ShelfFields>): Promise<void> {
    await db.shelf.update(id, { ...patch, updatedAt: new Date().toISOString() });
  }

  /**
   * Takes a book off the shelf. Catalog rows stay cached for re-adding,
   * except hand-typed ones, which nothing else can reach.
   */
  function remove(id: string): Promise<void> {
    return db.transaction('rw', db.works, db.editions, db.shelf, async () => {
      const entry = await db.shelf.get(id);
      if (!entry) return;
      await db.shelf.delete(id);
      const work = await db.works.get(entry.workId);
      if (work?.source === 'manual') {
        await db.editions.where('workId').equals(work.id).delete();
        await db.works.delete(work.id);
      }
    });
  }

  return { list, addFromCatalog, addManual, update, remove };
}

export const library = libraryRepo(defaultDb);
