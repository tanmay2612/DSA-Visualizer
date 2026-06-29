import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Classic insertion sort. The region to the left of `i` is treated
 * as sorted; each iteration picks the element at `i` (the "key")
 * and shifts it leftward past every larger already-sorted element
 * until it finds its slot.
 *
 * `mark-active` highlights the key element throughout its entire
 * shift — it's re-yielded with the key's current index on every
 * comparison/shift step of this pass, so the highlight visually
 * "follows" the key as it moves left, distinct from the element
 * it's currently being compared against.
 */
function* insertionSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);
  const n = arr.length;

  if (n > 0) {
    yield { type: 'mark-sorted', indices: [0], array: [...arr] };
  }

  for (let i = 1; i < n; i++) {
    let j = i;
    yield { type: 'mark-active', index: j, array: [...arr] };

    while (j > 0) {
      yield { type: 'compare', indices: [j - 1, j], array: [...arr] };

      if (arr[j - 1].value <= arr[j].value) break;

      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      j -= 1;
      yield { type: 'swap', indices: [j, j + 1], array: [...arr] };
      yield { type: 'mark-active', index: j, array: [...arr] };
    }

    // Everything from 0..i is sorted relative to itself once the
    // key has found its slot for this pass (re-stating indices
    // 0..i each pass is harmless — mark-sorted accumulates into a
    // Set in the adapter, so repeats are no-ops).
    yield {
      type: 'mark-sorted',
      indices: Array.from({ length: i + 1 }, (_, idx) => idx),
      array: [...arr],
    };
  }

  yield { type: 'done', array: [...arr], outcome: 'sort' };
}

export const insertionSort: AlgorithmDefinition<number[]> = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Builds up a sorted region one element at a time, shifting each new element left past anything larger until it finds its slot.',
  complexity: {
    time: { best: 'O(n)', average: 'O(n^2)', worst: 'O(n^2)' },
    space: 'O(1)',
  },
  pseudocode: [
    'for i from 1 to n - 1:',
    '  key = array[i]',
    '  j = i - 1',
    '  while j >= 0 and array[j] > key:',
    '    array[j + 1] = array[j]',
    '    j = j - 1',
    '  array[j + 1] = key',
  ],
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: insertionSortGenerator,
};
