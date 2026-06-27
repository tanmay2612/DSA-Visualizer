import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';

/**
 * Classic bubble sort, written as a generator so the engine can
 * drain it into a cached step array (see engine/AlgorithmEngine.ts
 * for why steps are cached rather than pulled lazily).
 *
 * Every array snapshot is a fresh copy ([...arr]) rather than a
 * reference to the working array. This is what makes reverse
 * playback and scrubbing trivial later — each cached step is a
 * complete, independent snapshot, not a diff that must be replayed
 * from the start to reconstruct.
 */
function* bubbleSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = [...input];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swappedThisPass = false;

    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1], array: [...arr] };

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swappedThisPass = true;
        yield { type: 'swap', indices: [j, j + 1], array: [...arr] };
      }
    }

    yield { type: 'mark-sorted', indices: [n - i - 1], array: [...arr] };

    // Classic optimization: if a full pass made no swaps, the
    // array is already sorted — stop early rather than running
    // the remaining (no-op) passes. Worth keeping even in a
    // teaching visualization, since it's part of what makes
    // bubble sort's best-case O(n) rather than always O(n^2).
    if (!swappedThisPass) break;
  }

  yield { type: 'mark-sorted', indices: arr.map((_, idx) => idx), array: [...arr] };
  yield { type: 'done', array: [...arr] };
}

export const bubbleSort: AlgorithmDefinition<number[]> = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  visualizationType: 'array',
  complexity: {
    time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' },
    space: 'O(1)',
  },
  pseudocode: [
    'for i from 0 to n - 1:',
    '  swapped = false',
    '  for j from 0 to n - i - 2:',
    '    if array[j] > array[j + 1]:',
    '      swap(array[j], array[j + 1])',
    '      swapped = true',
    '  if not swapped:',
    '    break',
  ],
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: bubbleSortGenerator,
};
