import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { tagWithIds } from '../shared/arrayElements';
import type { SearchInput } from './linearSearch';

/**
 * Binary search only works on a sorted array — this isn't a
 * visualization detail, it's the actual precondition the algorithm
 * requires to be correct. generateRandomInput enforces this by
 * sorting `values` before picking a target, rather than leaving it
 * to chance that a random array happens to be sorted (it won't be).
 *
 * `eliminate-range` is yielded for the half of the current search
 * window that gets ruled out each iteration — this is the one
 * visual that actually explains why binary search is fast: the
 * search space visibly shrinks by half every step, rather than
 * scanning element by element the way linear search does.
 */
function* binarySearchGenerator(input: SearchInput): Generator<ArrayAlgorithmStep> {
  const { values, target } = input;
  const arr = tagWithIds(values);
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    yield { type: 'compare-target', index: mid, targetValue: target, array: [...arr] };

    if (arr[mid].value === target) {
      yield { type: 'found', index: mid, array: [...arr] };
      yield { type: 'done', array: [...arr], outcome: 'found', foundIndex: mid };
      return;
    }

    if (arr[mid].value < target) {
      // Target is to the right: the midpoint itself and everything
      // at or to its left is eliminated.
      yield {
        type: 'eliminate-range',
        indices: Array.from({ length: mid - lo + 1 }, (_, i) => lo + i),
        array: [...arr],
      };
      lo = mid + 1;
    } else {
      // Target is to the left: the midpoint itself and everything
      // at or to its right is eliminated.
      yield {
        type: 'eliminate-range',
        indices: Array.from({ length: hi - mid + 1 }, (_, i) => mid + i),
        array: [...arr],
      };
      hi = mid - 1;
    }
  }

  yield { type: 'done', array: [...arr], outcome: 'not-found' };
}

function generateBinarySearchInput(size: number): SearchInput {
  const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5).sort(
    (a, b) => a - b,
  );
  const shouldBeFindable = Math.random() < 0.75;

  if (shouldBeFindable && values.length > 0) {
    const targetIndex = Math.floor(Math.random() * values.length);
    return { values, target: values[targetIndex] };
  }

  return { values, target: 999 };
}

export const binarySearch: AlgorithmDefinition<SearchInput> = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Repeatedly checks the middle of the remaining search range and discards the half that cannot contain the target — requires a sorted array.',
  complexity: {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    space: 'O(1)',
  },
  pseudocode: [
    'binarySearch(array, target):',
    '  lo = 0, hi = n - 1',
    '  while lo <= hi:',
    '    mid = (lo + hi) / 2',
    '    if array[mid] == target: return mid',
    '    if array[mid] < target: lo = mid + 1',
    '    else: hi = mid - 1',
    '  return not found',
  ],
  generateRandomInput: generateBinarySearchInput,
  run: binarySearchGenerator,
};
