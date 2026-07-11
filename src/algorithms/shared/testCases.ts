import type { AlgorithmDefinition } from './types';

/**
 * Test Case Panel data (Phase 10). Deliberately NOT keyed per
 * algorithm id: every sorting algorithm produces the exact same
 * final sorted array for the exact same input, so one shared list
 * of {input, expected} pairs covers all of them — bubble sort,
 * quick sort, and heap sort all pass or fail the same cases the
 * same way. Keeping this as one small static list (rather than a
 * backend-driven test-case store) is what the phase brief means by
 * "lightweight" — no database, no test management dashboard.
 */
export interface ArrayTestCase {
  id: string;
  label: string;
  input: number[];
  expected: number[];
}

export const SORTING_TEST_CASES: ArrayTestCase[] = [
  { id: 'basic', label: 'Basic', input: [5, 1, 4, 2, 8], expected: [1, 2, 4, 5, 8] },
  { id: 'sorted', label: 'Already sorted', input: [1, 2, 3, 4, 5], expected: [1, 2, 3, 4, 5] },
  { id: 'reverse', label: 'Reverse', input: [5, 4, 3, 2, 1], expected: [1, 2, 3, 4, 5] },
  { id: 'duplicates', label: 'Duplicates', input: [4, 2, 4, 1, 2], expected: [1, 2, 2, 4, 4] },
  {
    id: 'negative',
    label: 'Negative values',
    input: [-3, 5, -1, 0, 2],
    expected: [-3, -1, 0, 2, 5],
  },
];

/**
 * Synchronously drains a sorting algorithm's generator (same `run`
 * used by AlgorithmEngine, just consumed eagerly here instead of
 * cached step-by-step) and returns the values from its final
 * snapshot. Deliberately does not touch AlgorithmEngine or create a
 * second playback system — this only needs the *result*, not
 * step-by-step playback, so draining the generator directly is the
 * minimal way to get it.
 */
export function computeSortedResult(
  definition: AlgorithmDefinition<number[]>,
  input: number[],
): number[] {
  let lastArray: number[] = input;
  for (const step of definition.run(input)) {
    if ('array' in step) {
      lastArray = step.array.map((element) => element.value);
    }
  }
  return lastArray;
}

export function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
