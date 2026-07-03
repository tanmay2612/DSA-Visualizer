import { describe, it, expect } from 'vitest';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { mergeSort } from './mergeSort';
import { quickSort } from './quickSort';
import { heapSort } from './heapSort';
import type { ArrayAlgorithmStep } from '@/algorithms/shared/types';

const algorithms = [bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort];

function runSort(algo: (typeof algorithms)[0], input: number[]) {
  const steps = [...algo.run(input)] as ArrayAlgorithmStep[];
  const last = steps[steps.length - 1];
  if (last.type !== 'done') throw new Error(`Last step is not done: ${last.type}`);
  if (last.outcome !== 'sort') throw new Error(`Expected sort outcome, got ${last.outcome}`);
  return last.array.map((e) => e.value);
}

describe('Sorting algorithms', () => {
  algorithms.forEach((algo) => {
    describe(algo.name, () => {
      it('sorts a typical array', () => {
        const input = [5, 2, 8, 1, 9, 3, 7, 4];
        expect(runSort(algo, input)).toEqual([...input].sort((a, b) => a - b));
      });

      it('handles already sorted input', () => {
        expect(runSort(algo, [1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
      });

      it('handles reverse sorted input', () => {
        expect(runSort(algo, [5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
      });

      it('handles duplicates', () => {
        const input = [3, 1, 3, 2, 3];
        expect(runSort(algo, input)).toEqual([...input].sort((a, b) => a - b));
      });

      it('handles single element', () => {
        expect(runSort(algo, [7])).toEqual([7]);
      });

      it('handles empty array', () => {
        expect(runSort(algo, [])).toEqual([]);
      });

      it('last step has outcome sort', () => {
        const steps = [...algo.run([3, 1, 2])] as ArrayAlgorithmStep[];
        const last = steps[steps.length - 1];
        expect(last.type).toBe('done');
        if (last.type === 'done') expect(last.outcome).toBe('sort');
      });
    });
  });
});
