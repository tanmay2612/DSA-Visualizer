import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Classic selection sort. Each pass scans the unsorted region for
 * its minimum, tracking the current best candidate with
 * `mark-active` (re-yielded every time a new minimum is found, not
 * on every comparison — so the highlight only moves when the
 * tracked minimum actually changes, which is the part worth
 * watching). One swap per pass moves the found minimum into place,
 * unlike bubble/insertion sort's many swaps per pass.
 */
function* selectionSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    yield { type: 'mark-active', index: minIndex, array: [...arr] };

    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', indices: [minIndex, j], array: [...arr] };

      if (arr[j].value < arr[minIndex].value) {
        minIndex = j;
        yield { type: 'mark-active', index: minIndex, array: [...arr] };
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      yield { type: 'swap', indices: [i, minIndex], array: [...arr] };
    }

    yield { type: 'mark-sorted', indices: [i], array: [...arr] };
  }

  if (n > 0) {
    yield { type: 'mark-sorted', indices: [n - 1], array: [...arr] };
  }

  yield { type: 'done', array: [...arr], outcome: 'sort' };
}

export const selectionSort: AlgorithmDefinition<number[]> = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Scans the unsorted region each pass to find its minimum, then swaps it into place — one swap per pass, unlike bubble or insertion sort.',
  complexity: {
    time: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
    space: 'O(1)',
  },
  pseudocode: [
    'for i from 0 to n - 2:',
    '  minIndex = i',
    '  for j from i + 1 to n - 1:',
    '    if array[j] < array[minIndex]:',
    '      minIndex = j',
    '  if minIndex != i:',
    '    swap(array[i], array[minIndex])',
  ],
  // `mark-active` fires both at the once-per-pass initialization
  // (line 1, `minIndex = i`) and the more frequent in-loop update
  // (line 4, `minIndex = j`) — mapped to line 4 as the more
  // representative occurrence, an honest approximation rather than
  // a claim of perfect precision (see AlgorithmDefinition's
  // pseudocodeLineMap doc comment in shared/types.ts).
  pseudocodeLineMap: {
    'mark-active': 4,
    compare: 3,
    swap: 6,
  },
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: selectionSortGenerator,
};
