import type { AlgorithmDefinition } from '../shared/types';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { mergeSort } from './mergeSort';
import { quickSort } from './quickSort';
import { heapSort } from './heapSort';

/**
 * Sorting category registry. Phase 4 added merge/quick/insertion/
 * selection/heap sort here — each was one new file plus one line
 * added to this array, with zero changes to engine/, components/
 * visualization/, or components/controls/. That's the actual proof
 * the architecture generalizes, not just an assertion of it.
 */
export const sortingAlgorithms: AlgorithmDefinition<number[]>[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
];
