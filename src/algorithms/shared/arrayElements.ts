import type { ArrayElement } from './types';

/**
 * Tags each value in a raw input array with a stable id, in input
 * order. Every array-based algorithm (sorting, searching) calls
 * this once at the start of its generator, then operates on
 * `ArrayElement[]` internally so every yielded step already carries
 * identity — no algorithm re-implements id assignment itself.
 */
export function tagWithIds(values: number[]): ArrayElement[] {
  return values.map((value, id) => ({ id, value }));
}

/** Strips ids back to a plain value array, where only the values
 *  are needed (e.g. comparisons, complexity demonstrations). */
export function untag(elements: ArrayElement[]): number[] {
  return elements.map((element) => element.value);
}
