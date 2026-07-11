import type { ArrayAlgorithmStep } from '../shared/types';
import { tagWithIds } from '../shared/arrayElements';
import { generateRandomArray } from '../shared/generateRandomInput';
import type { InterviewProblemDefinition } from './types';

/** Two Sum's input isn't just an array — it's an array plus the
 *  target it's being searched against. Every other interview
 *  problem in this phase happens to fit plain `number[]`, but this
 *  one genuinely doesn't, so InterviewProblemDetailPage renders a
 *  small dedicated input form for it instead of reusing
 *  ArrayInputControls (which only knows how to produce number[]). */
export interface TwoSumInput {
  array: number[];
  target: number;
}

/**
 * Brute-force O(n^2) pair check, chosen deliberately over the O(n)
 * hash-map approach for this visualization: the hash-map version's
 * real state (a Map building up) has no natural home in the
 * existing array-step vocabulary, whereas "compare every pair"
 * maps directly onto `compare` steps a learner already recognizes
 * from sorting. The problem statement/complexity below are honest
 * about this being O(n^2) as visualized, with a note that O(n) is
 * possible with a hash map.
 */
function* twoSumGenerator(input: TwoSumInput): Generator<ArrayAlgorithmStep> {
  const { array, target } = input;
  const arr = tagWithIds(array);

  for (let i = 0; i < arr.length; i++) {
    yield { type: 'mark-active', index: i, array: [...arr] };
    for (let j = i + 1; j < arr.length; j++) {
      yield { type: 'compare', indices: [i, j], array: [...arr] };
      if (arr[i].value + arr[j].value === target) {
        yield { type: 'mark-result', indices: [i, j], array: [...arr] };
        yield {
          type: 'done',
          array: [...arr],
          outcome: 'result',
          indices: [i, j],
          resultLabel: `${arr[i].value} + ${arr[j].value} = ${target} — indices [${i}, ${j}].`,
        };
        return;
      }
    }
  }

  yield {
    type: 'done',
    array: [...arr],
    outcome: 'result',
    indices: [],
    resultLabel: `No two numbers sum to ${target}.`,
  };
}

export const twoSum: InterviewProblemDefinition<TwoSumInput> = {
  id: 'two-sum',
  name: 'Two Sum',
  category: 'interview',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Find the two numbers in an array that add up to a given target and return their indices.',
  topics: ['Array', 'Hash Map'],
  problemStatement:
    'Given an array of integers and a target value, return the indices of the two numbers that add up to the target. Assume exactly one solution exists, and the same element cannot be used twice.',
  example: {
    input: 'array = [2, 7, 11, 15], target = 9',
    output: '[0, 1]',
    explanation: 'array[0] + array[1] = 2 + 7 = 9.',
  },
  complexity: {
    // Visualized as brute-force pair checking (see generator's doc
    // comment) — an O(n) hash-map approach exists and is mentioned
    // in the pseudocode's closing comment, but isn't what the
    // step-by-step trace shows here.
    time: { best: 'O(n^2)', average: 'O(n^2)', worst: 'O(n^2)' },
    space: 'O(1)',
  },
  pseudocode: [
    'for i from 0 to n - 1:',
    '  for j from i + 1 to n - 1:',
    '    if array[i] + array[j] == target:',
    '      return [i, j]',
    '// A hash map of value -> index reduces this to O(n) time',
  ],
  pseudocodeLineMap: {
    'mark-active': 0,
    compare: 2,
    'mark-result': 3,
  },
  generateRandomInput: (size: number) => {
    const array = generateRandomArray(Math.max(size, 4), 1, 30);
    const i = Math.floor(Math.random() * array.length);
    let j = Math.floor(Math.random() * array.length);
    while (j === i) j = Math.floor(Math.random() * array.length);
    const target = array[i] + array[j];
    return { array, target };
  },
  run: twoSumGenerator,
};
