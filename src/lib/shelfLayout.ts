import type { Book } from '../types';
import { initials, lastName } from './book';

export interface ShelfMetrics {
  scale: number;
  gap: number;
  shelfHeight: number;
  slotWidth: number;
  slotHeight: number;
  surnameFontSize: number;
}

export interface SpineMetrics {
  width: number;
  height: number;
  titleFontSize: number;
  titleMaxHeight: number;
  initialsFontSize: number;
  initials: string;
  surname: string;
}

/** Spines shrink on narrow screens; `bookSize` is the user-facing scale. */
export function shelfMetrics(containerWidth: number, bookSize: number): ShelfMetrics {
  const scale = (containerWidth < 600 ? 0.7 : 1) * bookSize;
  return {
    scale,
    gap: Math.round(6 * scale),
    shelfHeight: Math.round(510 * scale),
    slotWidth: Math.round(76 * scale),
    slotHeight: Math.round(400 * scale),
    surnameFontSize: Math.round(23 * scale),
  };
}

/**
 * Greedily packs books into shelves at a fixed spine size. The first shelf
 * also holds the Add-a-book slot. Always returns at least one (maybe empty)
 * shelf so the slot has somewhere to live.
 */
export function packShelves(books: Book[], containerWidth: number, m: ShelfMetrics): Book[][] {
  const avail = containerWidth - 40;
  const shelves: Book[][] = [];
  let row: Book[] = [];
  let used = m.slotWidth + Math.round(10 * m.scale);
  for (const b of books) {
    const w = Math.round(b.spineWidth * m.scale) + m.gap;
    if (row.length && used + w > avail) {
      shelves.push(row);
      row = [];
      used = 0;
    }
    row.push(b);
    used += w;
  }
  if (row.length || !shelves.length) shelves.push(row);
  return shelves;
}

/** Sizes the title to fit the spine, leaving room for initials and surname. */
export function spineMetrics(b: Book, scale: number, showAuthors: boolean): SpineMetrics {
  const surname = lastName(b.author);
  const reserved = showAuthors ? 110 + Math.ceil(surname.length * 10.5) : 40;
  const titleMaxHeight = b.spineHeight - reserved;
  const maxFs = b.spineWidth > 88 ? 34 : b.spineWidth > 76 ? 30 : 27;
  const titleFontSize = Math.max(17, Math.min(maxFs, Math.floor(titleMaxHeight / (b.title.length * 0.42))));
  return {
    width: Math.round(b.spineWidth * scale),
    height: Math.round(b.spineHeight * scale),
    titleFontSize: Math.round(titleFontSize * scale),
    titleMaxHeight: Math.round(titleMaxHeight * scale),
    initialsFontSize: Math.round((b.spineWidth > 84 ? 32 : 27) * scale),
    initials: initials(b.author),
    surname,
  };
}
