import type { Binding, Rating, SelectionTheme, Status, Texture } from '../types';

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
 * Default spine size, binding and texture. `index` is the book's position in
 * the full catalog (seeds first, then added books) at creation time.
 */
export function defaultLook(title: string, index: number) {
  const h = hash(title);
  return {
    binding: BINDINGS[(index * 5 + h) % BINDINGS.length]!.key,
    texture: ((h >> 5) % 2 ? 'leather' : 'linen') as Texture,
    spineWidth: 66 + (h % 34),
    spineHeight: 370 + ((h >> 3) % 100),
  };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
