import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Quicksort using the Lomuto partition scheme (pivot = last element
 * of the current range). `mark-active` is re-yielded with the
 * pivot's index alongside every comparison made during that
 * partition pass — `mark-active` is transient-per-step by the type
 * contract (see shared/types.ts), so a persistent-looking highlight
 * is achieved by the algorithm re-stating it on each relevant step,
 * not by the adapter remembering it on the algorithm's behalf.
 *
 * Note the pivot's *index* shifts as elements get swapped during
 * partitioning (it stays at `hi` until the final swap places it at
 * `i + 1`), so `mark-active`'s index argument changes accordingly —
 * it always points at wherever the pivot value currently sits.
 */
function* quickSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);
  const n = arr.length;

  function* partition(lo: number, hi: number): Generator<ArrayAlgorithmStep, number> {
    let pivotIndex = hi;
    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      yield { type: 'mark-active', index: pivotIndex, array: [...arr] };
      yield { type: 'compare', indices: [j, pivotIndex], array: [...arr] };

      if (arr[j].value < arr[pivotIndex].value) {
        i += 1;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          yield { type: 'swap', indices: [i, j], array: [...arr] };
        }
      }
    }

    const finalPivotIndex = i + 1;
    if (finalPivotIndex !== pivotIndex) {
      [arr[finalPivotIndex], arr[pivotIndex]] = [arr[pivotIndex], arr[finalPivotIndex]];
      yield { type: 'swap', indices: [finalPivotIndex, pivotIndex], array: [...arr] };
      pivotIndex = finalPivotIndex;
    }

    yield { type: 'mark-sorted', indices: [pivotIndex], array: [...arr] };
    return pivotIndex;
  }

  function* quickSortRange(lo: number, hi: number): Generator<ArrayAlgorithmStep> {
    if (lo >= hi) {
      // A single-element (or empty) range is trivially sorted.
      if (lo === hi && lo >= 0 && lo < n) {
        yield { type: 'mark-sorted', indices: [lo], array: [...arr] };
      }
      return;
    }

    const pivotFinalIndex = yield* partition(lo, hi);
    yield* quickSortRange(lo, pivotFinalIndex - 1);
    yield* quickSortRange(pivotFinalIndex + 1, hi);
  }

  yield* quickSortRange(0, n - 1);
  yield { type: 'done', array: [...arr], outcome: 'sort' };
}

export const quickSort: AlgorithmDefinition<number[]> = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  visualizationType: 'array',
  difficulty: 'intermediate',
  description:
    'Picks a pivot, partitions the array so smaller elements end up on its left and larger on its right, then recursively sorts each side.',
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n^2)' },
    space: 'O(log n)',
  },
  pseudocode: [
    'quickSort(array, lo, hi):',
    '  if lo >= hi: return',
    '  p = partition(array, lo, hi)',
    '  quickSort(array, lo, p - 1)',
    '  quickSort(array, p + 1, hi)',
    '',
    'partition(array, lo, hi):',
    '  pivot = array[hi]',
    '  i = lo - 1',
    '  for j from lo to hi - 1:',
    '    if array[j] < pivot:',
    '      i = i + 1',
    '      swap(array[i], array[j])',
    '  swap(array[i + 1], array[hi])',
    '  return i + 1',
  ],
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: quickSortGenerator,
};
