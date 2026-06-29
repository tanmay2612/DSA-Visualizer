import type { AlgorithmDefinition, ArrayAlgorithmStep, ArrayElement } from '../shared/types';
import { generateRandomArray } from '../shared/generateRandomInput';
import { tagWithIds } from '../shared/arrayElements';

/**
 * Classic top-down merge sort. The tricky part for a visualizer:
 * merge sort is naturally recursive over *subarrays*, but the
 * canvas only ever renders one flat array (see ArrayCanvas / the
 * SceneDescription boundary) — there's no "zoom into this sub-
 * range" concept. So every yielded step snapshots the FULL working
 * array, with the recursive calls all mutating one shared array by
 * reference rather than each operating on its own slice copy.
 *
 * `mark-active` is repurposed slightly here: instead of tracking a
 * single "best candidate" (selection sort's running minimum), each
 * step in the merge highlights the index *currently being written*,
 * which is enough for a viewer to see the merge pointer advancing
 * through the [lo, hi) window without needing a separate highlight
 * color for "the range currently in play."
 *
 * `overwrite` is genuinely needed here, unlike the swap-based
 * algorithms: merging writes the smaller of two compared elements
 * into the next output slot, which isn't a swap between two
 * existing positions — it's "place this specific element here,"
 * which can shift everything after it. Each `overwrite`'s array
 * snapshot carries the full element (with its original id) at that
 * position, so the canvas animates it as the same bar relocating,
 * not a new bar appearing.
 */
function* mergeSortGenerator(input: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(input);
  const n = arr.length;

  function* mergeSortRange(lo: number, hi: number): Generator<ArrayAlgorithmStep> {
    if (hi - lo <= 1) return;

    const mid = Math.floor((lo + hi) / 2);
    yield* mergeSortRange(lo, mid);
    yield* mergeSortRange(mid, hi);
    yield* merge(lo, mid, hi);
  }

  function* merge(lo: number, mid: number, hi: number): Generator<ArrayAlgorithmStep> {
    const left = arr.slice(lo, mid);
    const right = arr.slice(mid, hi);

    let i = 0;
    let j = 0;
    let k = lo;

    while (i < left.length && j < right.length) {
      yield { type: 'mark-active', index: k, array: [...arr] };
      // Comparing the two candidate elements' current (pre-write)
      // positions within the shared array: left's candidate is
      // still physically at lo + i, right's at mid + j, since
      // neither side has been overwritten yet at this point in the
      // merge.
      yield { type: 'compare', indices: [lo + i, mid + j], array: [...arr] };

      const takeLeft = left[i].value <= right[j].value;
      const next: ArrayElement = takeLeft ? left[i] : right[j];

      arr[k] = next;
      if (takeLeft) i += 1;
      else j += 1;
      k += 1;

      yield { type: 'overwrite', index: k - 1, array: [...arr] };
    }

    while (i < left.length) {
      arr[k] = left[i];
      i += 1;
      k += 1;
      yield { type: 'overwrite', index: k - 1, array: [...arr] };
    }

    while (j < right.length) {
      arr[k] = right[j];
      j += 1;
      k += 1;
      yield { type: 'overwrite', index: k - 1, array: [...arr] };
    }

    yield {
      type: 'mark-sorted',
      indices: Array.from({ length: hi - lo }, (_, idx) => lo + idx),
      array: [...arr],
    };
  }

  yield* mergeSortRange(0, n);
  yield { type: 'done', array: [...arr], outcome: 'sort' };
}

export const mergeSort: AlgorithmDefinition<number[]> = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  visualizationType: 'array',
  difficulty: 'intermediate',
  description:
    'Recursively splits the array in half, sorts each half, then merges the two sorted halves back together — guaranteed O(n log n) regardless of input.',
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
  },
  pseudocode: [
    'mergeSort(array, lo, hi):',
    '  if hi - lo <= 1: return',
    '  mid = (lo + hi) / 2',
    '  mergeSort(array, lo, mid)',
    '  mergeSort(array, mid, hi)',
    '  merge(array, lo, mid, hi)',
    '',
    'merge(array, lo, mid, hi):',
    '  combine the two sorted halves into one sorted run',
    '  by repeatedly taking the smaller of the two fronts',
  ],
  generateRandomInput: (size: number) => generateRandomArray(size),
  run: mergeSortGenerator,
};
