/**
 * Generates a random array of distinct-ish integers for visualization.
 * Values are kept in a friendly display range (5–99) regardless of
 * array size, since canvases scale bar height relative to a fixed
 * max rather than the actual data range.
 */
export function generateRandomArray(size: number, min = 5, max = 99): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
