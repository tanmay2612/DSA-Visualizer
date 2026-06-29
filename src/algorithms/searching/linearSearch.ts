import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Linear search input is a (target, values) pair rather than a
 * plain number[] — unlike sorting, a search needs something to
 * search FOR, not just something to search THROUGH. This is why
 * AlgorithmDefinition is generic over TInput: searching algorithms
 * use this richer shape while every sorting algorithm uses plain
 * number[], and the engine/canvas/adapter layer doesn't care either
 * way — they only ever see the ArrayAlgorithmStep output, never the
 * input shape directly.
 */
export interface SearchInput {
  values: number[];
  target: number;
}

/**
 * Scans left to right, comparing each element against the target
 * via `compare-target` (searching's counterpart to `compare`, since
 * there's no second array index to compare against — see
 * shared/types.ts). Yields `found` the moment a match is located,
 * or finishes with `done` and no `foundIndex` if the target never
 * appears.
 */
function* linearSearchGenerator(input: SearchInput): Generator<ArrayAlgorithmStep> {
  const { values, target } = input;
  const arr = tagWithIds(values);

  for (let i = 0; i < arr.length; i++) {
    yield { type: 'compare-target', index: i, targetValue: target, array: [...arr] };

    if (arr[i].value === target) {
      yield { type: 'found', index: i, array: [...arr] };
      yield { type: 'done', array: [...arr], outcome: 'found', foundIndex: i };
      return;
    }
  }

  yield { type: 'done', array: [...arr], outcome: 'not-found' };
}

/**
 * Generates a random array, then either embeds the target at a
 * random index (most of the time) or omits it entirely (the rest),
 * so both the "found" and "not found" code paths are reachable from
 * the random-input button rather than only ever demonstrating one.
 */
function generateLinearSearchInput(size: number): SearchInput {
  const values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5);
  const shouldBeFindable = Math.random() < 0.75;

  if (shouldBeFindable && values.length > 0) {
    const targetIndex = Math.floor(Math.random() * values.length);
    return { values, target: values[targetIndex] };
  }

  // Pick a target guaranteed not to collide with any generated
  // value (values are in [5, 94]; 999 is outside that range).
  return { values, target: 999 };
}

export const linearSearch: AlgorithmDefinition<SearchInput> = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Checks each element one at a time from the start until it finds the target or runs out of elements — no assumptions about the array being sorted.',
  complexity: {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  pseudocode: [
    'linearSearch(array, target):',
    '  for i from 0 to n - 1:',
    '    if array[i] == target:',
    '      return i',
    '  return not found',
  ],
  generateRandomInput: generateLinearSearchInput,
  run: linearSearchGenerator,
};
