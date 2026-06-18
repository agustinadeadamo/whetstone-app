import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type CardStatus,
  type WeightedItem,
  weightForStatus,
  weightedShuffle,
} from './sampler';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Deterministic LCG (Numerical Recipes constants) for seeded randomness. */
function makeLcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const sorted = (values: string[]): string[] => [...values].sort();

describe('weightForStatus', () => {
  it('maps the four known statuses to 4 / 3 / 2 / 1', () => {
    expect(weightForStatus('weak')).toBe(4);
    expect(weightForStatus('new')).toBe(3);
    expect(weightForStatus('learning')).toBe(2);
    expect(weightForStatus('mastered')).toBe(1);
  });

  it('defaults an unknown status to weight 1', () => {
    // Cast simulates an unexpected value arriving at runtime (e.g. from the DB).
    expect(weightForStatus('frozen' as CardStatus)).toBe(1);
  });
});

describe('weightedShuffle', () => {
  const deck: WeightedItem<string>[] = [
    { item: 'a', status: 'weak' },
    { item: 'b', status: 'new' },
    { item: 'c', status: 'learning' },
    { item: 'd', status: 'mastered' },
    { item: 'e', status: 'weak' },
  ];

  it('returns every item exactly once, losing and duplicating none', () => {
    const out = weightedShuffle(deck);
    expect(out).toHaveLength(deck.length);
    expect(sorted(out)).toEqual(sorted(deck.map((d) => d.item)));
  });

  it('does not mutate the input array', () => {
    const input: WeightedItem<string>[] = [
      { item: 'a', status: 'weak' },
      { item: 'b', status: 'mastered' },
    ];
    const snapshot = [...input];
    weightedShuffle(input);
    expect(input).toEqual(snapshot);
    expect(input).toHaveLength(2);
  });

  it('orders by descending weight when the random draw is constant', () => {
    // A constant random collapses the key to a pure function of weight, so the
    // expected order is exactly weak > new > learning > mastered.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const scrambled: WeightedItem<string>[] = [
      { item: 'mastered', status: 'mastered' },
      { item: 'weak', status: 'weak' },
      { item: 'learning', status: 'learning' },
      { item: 'new', status: 'new' },
    ];
    expect(weightedShuffle(scrambled)).toEqual([
      'weak',
      'new',
      'learning',
      'mastered',
    ]);
  });

  it('lets the random key override raw weight (true Efraimidis–Spirakis)', () => {
    // A mastered card with a near-1 draw outranks a weak card with a near-0 one:
    // key(mastered) = 0.99 ** 1 ≈ 0.99 > key(weak) = 0.01 ** 0.25 ≈ 0.316.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // first item: mastered
      .mockReturnValueOnce(0.01); // second item: weak
    const out = weightedShuffle([
      { item: 'mastered', status: 'mastered' },
      { item: 'weak', status: 'weak' },
    ]);
    expect(out).toEqual(['mastered', 'weak']);
  });

  it('returns an empty array for empty input', () => {
    expect(weightedShuffle([])).toEqual([]);
  });

  it('returns the single item for a one-element input', () => {
    expect(weightedShuffle([{ item: 'only', status: 'weak' }])).toEqual([
      'only',
    ]);
  });

  it('reorders across calls as the random sequence changes', () => {
    const pair: WeightedItem<string>[] = [
      { item: 'a', status: 'weak' },
      { item: 'b', status: 'weak' },
    ];
    // Equal weights, so order follows the draws: larger draw wins.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1);
    expect(weightedShuffle(pair)).toEqual(['a', 'b']);

    vi.restoreAllMocks();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9);
    expect(weightedShuffle(pair)).toEqual(['b', 'a']);
  });

  it('statistically surfaces weak before mastered (~4x bias, seeded PRNG)', () => {
    // Seeded LCG instead of real randomness keeps this deterministic, not flaky.
    // For a weak (4) vs mastered (1) pair, P(weak first) = 4 / (4 + 1) = 0.8.
    const lcg = makeLcg(0x1234_5678);
    vi.spyOn(Math, 'random').mockImplementation(lcg);

    const trials = 4000;
    let weakFirst = 0;
    for (let i = 0; i < trials; i++) {
      const out = weightedShuffle([
        { item: 'weak', status: 'weak' },
        { item: 'mastered', status: 'mastered' },
      ]);
      if (out[0] === 'weak') weakFirst++;
    }

    const rate = weakFirst / trials;
    // Theoretical 0.8; a tolerant band absorbs sampling noise without flaking.
    expect(rate).toBeGreaterThan(0.75);
    expect(rate).toBeLessThan(0.85);
  });
});
