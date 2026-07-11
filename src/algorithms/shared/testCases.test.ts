import { describe, expect, it } from 'vitest';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { quickSort } from '@/algorithms/sorting/quickSort';
import { arraysEqual, computeSortedResult, SORTING_TEST_CASES } from './testCases';

describe('computeSortedResult', () => {
  it.each(SORTING_TEST_CASES)('bubbleSort passes case "$label"', ({ input, expected }) => {
    expect(computeSortedResult(bubbleSort, input)).toEqual(expected);
  });

  it.each(SORTING_TEST_CASES)('quickSort passes case "$label"', ({ input, expected }) => {
    expect(computeSortedResult(quickSort, input)).toEqual(expected);
  });

  it('matches the mandatory acceptance test 2 case: [3,1,2] -> [1,2,3]', () => {
    expect(computeSortedResult(bubbleSort, [3, 1, 2])).toEqual([1, 2, 3]);
  });
});

describe('arraysEqual', () => {
  it('returns true for identical arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('returns false for different values', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});
