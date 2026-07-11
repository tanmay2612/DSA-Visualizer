import { describe, expect, it } from 'vitest';
import { binarySearch } from './binarySearch';
import { linearSearch } from './linearSearch';
import type { SearchInput } from './linearSearch';

/**
 * Companion to SearchInputControls.test.tsx: proves that the
 * `{ values, target }` shape SearchInputControls now produces (in
 * place of the plain `number[]` ArrayInputControls used to send)
 * actually drives both algorithms correctly, including a
 * user-chosen custom target — the exact capability that was
 * reported missing.
 */
function drainFinal(gen: Generator<unknown>) {
  let last: unknown;
  for (const step of gen) last = step;
  return last as { type: string; outcome?: string; foundIndex?: number };
}

describe('Search algorithms with custom target (regression)', () => {
  it('binarySearch finds a user-chosen target in a user-chosen (sorted) array', () => {
    const input: SearchInput = { values: [1, 2, 5, 8], target: 8 };
    const last = drainFinal(binarySearch.run(input));
    expect(last.outcome).toBe('found');
    expect(last.foundIndex).toBe(3);
  });

  it('binarySearch correctly reports not-found for a custom target absent from the array', () => {
    const input: SearchInput = { values: [1, 2, 5, 8], target: 99 };
    const last = drainFinal(binarySearch.run(input));
    expect(last.outcome).toBe('not-found');
  });

  it('linearSearch finds a user-chosen target in a user-chosen array', () => {
    const input: SearchInput = { values: [5, 2, 8, 1], target: 8 };
    const last = drainFinal(linearSearch.run(input));
    expect(last.outcome).toBe('found');
    expect(last.foundIndex).toBe(2);
  });

  it('linearSearch correctly reports not-found for a custom target absent from the array', () => {
    const input: SearchInput = { values: [5, 2, 8, 1], target: 42 };
    const last = drainFinal(linearSearch.run(input));
    expect(last.outcome).toBe('not-found');
  });
});
