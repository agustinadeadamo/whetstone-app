/**
 * Weighted spaced-repetition sampler.
 *
 * Pure function — no I/O, no global state. Implements Efraimidis–Spirakis
 * weighted random ordering (A-Res): each item gets a sort key of
 * `random ** (1 / weight)` and items are ordered by *descending* key, so
 * higher-weight (weaker) cards probabilistically surface first. See ADR 0005.
 */

export type CardStatus = 'weak' | 'new' | 'learning' | 'mastered';

/** An item paired with the review status that determines its sampling weight. */
export interface WeightedItem<T> {
  item: T;
  status: CardStatus;
}

/** Sampling weights per status. A higher weight surfaces earlier, on average. */
const STATUS_WEIGHTS: Record<CardStatus, number> = {
  weak: 4,
  new: 3,
  learning: 2,
  mastered: 1,
};

/**
 * Weight for a review status. Defaults to 1 (mastered-equivalent) for any
 * value outside the known set, so unexpected runtime input degrades safely.
 */
export function weightForStatus(status: CardStatus): number {
  return STATUS_WEIGHTS[status] ?? 1;
}

/**
 * Order items by weighted random sampling (Efraimidis–Spirakis / A-Res).
 *
 * Each item is assigned the key `Math.random() ** (1 / weight)` and the items
 * are returned sorted by descending key. Pure: a given input together with a
 * given `Math.random` sequence always yields the same ordering. The input
 * array is not mutated; a new array of the unwrapped items is returned, and
 * every input item appears exactly once.
 */
export function weightedShuffle<T>(items: ReadonlyArray<WeightedItem<T>>): T[] {
  return items
    .map((entry) => ({
      item: entry.item,
      key: Math.random() ** (1 / weightForStatus(entry.status)),
    }))
    .sort((a, b) => b.key - a.key)
    .map((scored) => scored.item);
}
