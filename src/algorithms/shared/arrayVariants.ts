import { generateRandomArray } from './generateRandomInput';

/**
 * The set of input shapes a user can pick for an array-based
 * algorithm (Phase 8). Each variant exercises a genuinely different
 * code path in a sorting algorithm — e.g. insertion sort is fast on
 * "nearly sorted" and slow on "reverse sorted," which is exactly
 * the kind of thing a learner should be able to try directly rather
 * than only ever seeing one random shuffle.
 */
export type ArrayInputVariant =
  | 'random'
  | 'nearly-sorted'
  | 'reverse-sorted'
  | 'few-unique'
  | 'duplicate-heavy'
  | 'sorted';

const MIN_VALUE = 5;
const MAX_VALUE = 99;

/** Applies a small number of swaps to an otherwise-sorted array —
 *  small relative to size, so the result is mostly in order with a
 *  few local disturbances, not just a relabeled random shuffle. */
function nearlySorted(size: number): number[] {
  const values = generateRandomArray(size, MIN_VALUE, MAX_VALUE).sort((a, b) => a - b);
  const swapCount = Math.max(1, Math.floor(size * 0.15));
  for (let i = 0; i < swapCount; i++) {
    const a = Math.floor(Math.random() * size);
    const b = Math.floor(Math.random() * size);
    [values[a], values[b]] = [values[b], values[a]];
  }
  return values;
}

function reverseSorted(size: number): number[] {
  return generateRandomArray(size, MIN_VALUE, MAX_VALUE).sort((a, b) => b - a);
}

/** Only a handful of distinct values, repeated — stresses how an
 *  algorithm handles equal elements (e.g. quicksort's partition
 *  behavior when most comparisons tie). */
function fewUnique(size: number): number[] {
  const uniqueCount = Math.max(2, Math.min(4, Math.floor(size / 3)));
  const pool = Array.from(
    { length: uniqueCount },
    () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
  );
  return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
}

/** Looser than few-unique: more distinct values overall, but each
 *  one deliberately repeated, the middle ground between "random"
 *  and "few-unique." */
function duplicateHeavy(size: number): number[] {
  const baseCount = Math.max(2, Math.ceil(size / 2.5));
  const base = Array.from(
    { length: baseCount },
    () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
  );
  const result: number[] = [];
  while (result.length < size) {
    result.push(base[Math.floor(Math.random() * base.length)]);
  }
  return result;
}

function sorted(size: number): number[] {
  return generateRandomArray(size, MIN_VALUE, MAX_VALUE).sort((a, b) => a - b);
}

const VARIANT_GENERATORS: Record<ArrayInputVariant, (size: number) => number[]> = {
  random: (size) => generateRandomArray(size, MIN_VALUE, MAX_VALUE),
  'nearly-sorted': nearlySorted,
  'reverse-sorted': reverseSorted,
  'few-unique': fewUnique,
  'duplicate-heavy': duplicateHeavy,
  sorted,
};

export function generateArrayVariant(variant: ArrayInputVariant, size: number): number[] {
  return VARIANT_GENERATORS[variant](size);
}

export const ARRAY_INPUT_VARIANT_LABELS: Record<ArrayInputVariant, string> = {
  random: 'Random',
  'nearly-sorted': 'Nearly sorted',
  'reverse-sorted': 'Reverse sorted',
  'few-unique': 'Few unique values',
  'duplicate-heavy': 'Duplicate heavy',
  sorted: 'Sorted',
};
