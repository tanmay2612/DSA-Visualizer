import type { AlgorithmDefinition, ArrayAlgorithmStep } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Classic heap sort over an implicit binary max-heap: for an array
 * index `i`, its children live at `2i + 1` and `2i + 2`. Two
 * phases: (1) build-heap, sifting every non-leaf node down from the
 * bottom up; (2) repeatedly swap the root (max) to the end of the
 * unsorted region and re-sift the reduced heap.
 *
 * `mark-active` highlights the node currently being sifted down —
 * re-yielded as it moves deeper into the heap during one sift
 * operation, the same "highlight follows this element" pattern
 * insertion sort uses for its key.
 */
function* heapSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);
  const n = arr.length;

  function* siftDown(heapSize: number, root: number): Generator<ArrayAlgorithmStep> {
    let largest = root;
    yield { type: 'mark-active', index: root, array: [...arr] };

    for (;;) {
      const left = 2 * largest + 1;
      const right = 2 * largest + 2;
      let candidate = largest;

      if (left < heapSize) {
        yield { type: 'compare', indices: [left, candidate], array: [...arr] };
        if (arr[left].value > arr[candidate].value) candidate = left;
      }
      if (right < heapSize) {
        yield { type: 'compare', indices: [right, candidate], array: [...arr] };
        if (arr[right].value > arr[candidate].value) candidate = right;
      }

      if (candidate === largest) break;

      [arr[largest], arr[candidate]] = [arr[candidate], arr[largest]];
      yield { type: 'swap', indices: [largest, candidate], array: [...arr] };

      largest = candidate;
      yield { type: 'mark-active', index: largest, array: [...arr] };
    }
  }

  // Build-heap: sift down every non-leaf node, starting from the
  // last one and working back to the root.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* siftDown(n, i);
  }

  // Repeatedly extract the max (root) into the sorted tail.
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    yield { type: 'swap', indices: [0, end], array: [...arr] };
    yield { type: 'mark-sorted', indices: [end], array: [...arr] };

    yield* siftDown(end, 0);
  }

  if (n > 0) {
    yield { type: 'mark-sorted', indices: [0], array: [...arr] };
  }

  yield { type: 'done', array: [...arr], outcome: 'sort' };
}

export const heapSort: AlgorithmDefinition<number[]> = {
  id: 'heap-sort',
  name: 'Heap Sort',
  category: 'sorting',
  visualizationType: 'array',
  difficulty: 'advanced',
  description:
    'Arranges the array into an implicit max-heap, then repeatedly moves the largest remaining element to the end — in-place with no extra memory.',
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
  },
  pseudocode: [
    'buildMaxHeap(array):',
    '  for i from n/2 - 1 down to 0:',
    '    siftDown(array, n, i)',
    '',
    'heapSort(array):',
    '  buildMaxHeap(array)',
    '  for end from n - 1 down to 1:',
    '    swap(array[0], array[end])',
    '    siftDown(array, end, 0)',
    '',
    'siftDown(array, heapSize, root):',
    '  repeatedly swap root with its larger child',
    '  until root is bigger than both children',
  ],
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: heapSortGenerator,
};
