import type { ArrayAlgorithmStep } from '../shared/types';
import { tagWithIds } from '../shared/arrayElements';
import { generateRandomArray } from '../shared/generateRandomInput';
import type { InterviewProblemDefinition } from './types';

/**
 * Kadane's algorithm: track the best sum ending at the current
 * index (`current`) and the best sum seen anywhere so far
 * (`best`), extending or restarting `current` at each element.
 * O(n) single pass — the classic reason this problem is a staple:
 * the naive O(n^2)/O(n^3) approach is easy but the linear one
 * requires a real insight, which is exactly what the step-by-step
 * `mark-active`/`compare` trace below is meant to make visible.
 */
function* kadaneGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);

  let currentSum = arr[0].value;
  let currentStart = 0;
  let bestSum = arr[0].value;
  let bestStart = 0;
  let bestEnd = 0;

  yield { type: 'mark-active', index: 0, array: [...arr] };

  for (let i = 1; i < arr.length; i++) {
    yield { type: 'compare', indices: [i - 1, i], array: [...arr] };

    // Extending the running sum vs. starting fresh at `i` is the
    // one decision the whole algorithm hinges on.
    if (currentSum < 0) {
      currentSum = arr[i].value;
      currentStart = i;
    } else {
      currentSum += arr[i].value;
    }

    yield { type: 'mark-active', index: i, array: [...arr] };

    if (currentSum > bestSum) {
      bestSum = currentSum;
      bestStart = currentStart;
      bestEnd = i;
      yield {
        type: 'mark-result',
        indices: Array.from({ length: bestEnd - bestStart + 1 }, (_, k) => bestStart + k),
        array: [...arr],
      };
    }
  }

  const resultIndices = Array.from(
    { length: bestEnd - bestStart + 1 },
    (_, k) => bestStart + k,
  );

  yield {
    type: 'done',
    array: [...arr],
    outcome: 'result',
    indices: resultIndices,
    resultLabel: `Maximum subarray sum = ${bestSum} (indices ${bestStart}–${bestEnd}).`,
  };
}

export const maximumSubarray: InterviewProblemDefinition<number[]> = {
  id: 'maximum-subarray',
  name: "Maximum Subarray (Kadane's Algorithm)",
  category: 'interview',
  visualizationType: 'array',
  difficulty: 'intermediate',
  description:
    "Find the contiguous subarray with the largest sum, using Kadane's linear-time running-sum technique.",
  topics: ['Array', 'Dynamic Programming'],
  problemStatement:
    'Given an integer array (which may include negative numbers), find the contiguous subarray with the largest sum and return that sum.',
  example: {
    input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    output: '6',
    explanation: 'The subarray [4, -1, 2, 1] has the largest sum: 6.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  pseudocode: [
    'currentSum = array[0]; bestSum = array[0]',
    'for i from 1 to n - 1:',
    '  if currentSum < 0:',
    '    currentSum = array[i]  // start fresh',
    '  else:',
    '    currentSum += array[i]  // extend',
    '  if currentSum > bestSum:',
    '    bestSum = currentSum; record range',
    'return bestSum',
  ],
  pseudocodeLineMap: {
    compare: 1,
    'mark-active': 5,
    'mark-result': 7,
  },
  generateRandomInput: (size: number) =>
    generateRandomArray(size, -10, 15).map((v) => (Math.random() < 0.4 ? -v : v)),
  run: kadaneGenerator,
};
