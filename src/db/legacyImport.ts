import { seedRows } from '../data/seedBooks';
import type { Binding, Edition, Rating, ShelfEntry, ShelfFields, Status, Texture, Work } from '../types';

/** localStorage keys written before the database existed. */
const KEY = 'bookshelf-v2';

/** An added book as the localStorage version stored it. */
interface LegacyAddedBook {
  id: string;
  title: string;
  author: string;
  year: number;
  genres: string[];
  synopsis: string;
  binding: Binding;
  texture: Texture;
}

const SHELF_FIELDS: (keyof ShelfFields)[] = [
  'status',
  'rating',
  'notes',
  'dateRead',
  'progress',
  'binding',
  'texture',
];

function readJson(storage: Pick<Storage, 'getItem'>, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function pickShelfFields(patch: unknown): Partial<ShelfFields> {
  if (typeof patch !== 'object' || patch == null) return {};
  const src = patch as Record<string, unknown>;
  return Object.fromEntries(SHELF_FIELDS.filter((k) => k in src).map((k) => [k, src[k]]));
}

/**
 * The first-run contents of the database: the seed library, with whatever the
 * localStorage version recorded (added books, removed seeds, personal edits)
 * folded in. The old keys are left in place as a backup.
 */
export function initialRows(storage?: Pick<Storage, 'getItem'>): {
  works: Work[];
  editions: Edition[];
  entries: ShelfEntry[];
} {
  const { works, editions, entries } = seedRows();
  if (!storage) return { works, editions, entries };

  const added = readJson(storage, `${KEY}-added`);
  const removed = readJson(storage, `${KEY}-removed`);
  const personal = readJson(storage, `${KEY}-personal`);
  const removedIds = new Set(Array.isArray(removed) ? removed : []);
  const patches = typeof personal === 'object' && personal != null ? (personal as Record<string, unknown>) : {};

  const now = Date.now();
  const kept = entries.filter((e) => !removedIds.has(e.id));
  (Array.isArray(added) ? (added as LegacyAddedBook[]) : []).forEach((b, i) => {
    if (typeof b?.id !== 'string' || typeof b.title !== 'string') return;
    // Keep the order they were added in, after the seeds.
    const addedAt = new Date(now + i).toISOString();
    const catalogId = crypto.randomUUID();
    works.push({
      id: catalogId,
      source: 'manual',
      title: b.title,
      authors: b.author ? [b.author] : [],
      firstPublishYear: b.year,
      subjects: Array.isArray(b.genres) ? b.genres : [],
      description: b.synopsis ?? '',
      fetchedAt: addedAt,
    });
    editions.push({
      id: catalogId,
      workId: catalogId,
      source: 'manual',
      title: b.title,
      publishers: [],
      fetchedAt: addedAt,
    });
    kept.push({
      id: b.id,
      workId: catalogId,
      editionId: catalogId,
      status: 'want' as Status,
      rating: 0 as Rating,
      notes: '',
      dateRead: '',
      progress: 0,
      binding: b.binding,
      texture: b.texture,
      addedAt,
      updatedAt: addedAt,
    });
  });

  const withEdits = kept.map((e) => ({ ...e, ...pickShelfFields(patches[e.id]) }));
  // Removed seeds keep their catalog rows; they're harmless and re-addable.
  return { works, editions, entries: withEdits };
}
