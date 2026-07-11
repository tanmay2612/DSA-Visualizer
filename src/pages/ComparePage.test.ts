import { describe, expect, it } from 'vitest';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { selectionSort } from '@/algorithms/sorting/selectionSort';
import { insertionSort } from '@/algorithms/sorting/insertionSort';
import { computeSortedResult } from '@/algorithms/shared/testCases';
import { AlgorithmEngine } from '@/engine/AlgorithmEngine';

/**
 * Comparison Mode's core guarantee: every lane runs on the exact
 * same original array — nobody's engine silently randomizes or
 * mutates its own copy. Exercised at the engine/algorithm level
 * (not a full ComparePage render) to stay fast and independent of
 * DOM/React specifics, per the phase brief's "no massive new test
 * framework" instruction — this reuses the same AlgorithmEngine the
 * rest of the suite already tests.
 */
describe('Comparison Mode — shared input guarantee', () => {
  const sharedInput = [5, 1, 4, 2, 8];

  it('bubble, selection, and insertion sort all reach the same correct result from the same input', () => {
    const bubbleResult = computeSortedResult(bubbleSort, sharedInput);
    const selectionResult = computeSortedResult(selectionSort, sharedInput);
    const insertionResult = computeSortedResult(insertionSort, sharedInput);

    expect(bubbleResult).toEqual([1, 2, 4, 5, 8]);
    expect(selectionResult).toEqual([1, 2, 4, 5, 8]);
    expect(insertionResult).toEqual([1, 2, 4, 5, 8]);
  });

  it('original input array is never mutated by any of the three algorithms', () => {
    const original = [...sharedInput];
    computeSortedResult(bubbleSort, sharedInput);
    computeSortedResult(selectionSort, sharedInput);
    computeSortedResult(insertionSort, sharedInput);
    expect(sharedInput).toEqual(original);
  });

  it('three independent engines initialized with the same array each store that exact array as their input', () => {
    const engineA = new AlgorithmEngine<number[]>();
    const engineB = new AlgorithmEngine<number[]>();
    const engineC = new AlgorithmEngine<number[]>();

    engineA.initialize(bubbleSort, sharedInput);
    engineB.initialize(selectionSort, sharedInput);
    engineC.initialize(insertionSort, sharedInput);

    expect(engineA.input).toEqual(sharedInput);
    expect(engineB.input).toEqual(sharedInput);
    expect(engineC.input).toEqual(sharedInput);
  });
});
