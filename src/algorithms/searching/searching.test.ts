import { describe, it, expect } from 'vitest';
import { linearSearch } from './linearSearch';
import { binarySearch } from './binarySearch';
import type { ArrayAlgorithmStep } from '@/algorithms/shared/types';

describe('linearSearch', () => {
  it('finds an element that exists', () => {
    const steps = [
      ...linearSearch.run({ values: [5, 2, 8, 1, 9], target: 8 }),
    ] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'found') {
      expect(last.foundIndex).toBe(2);
    }
  });

  it('returns not-found when target is absent', () => {
    const steps = [
      ...linearSearch.run({ values: [5, 2, 8, 1, 9], target: 100 }),
    ] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    if (last.type === 'done') expect(last.outcome).toBe('not-found');
  });

  it('finds the first occurrence among duplicates', () => {
    const steps = [
      ...linearSearch.run({ values: [3, 1, 3, 2, 3], target: 3 }),
    ] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    if (last.type === 'done' && last.outcome === 'found') expect(last.foundIndex).toBe(0);
  });

  it('handles empty array', () => {
    const steps = [...linearSearch.run({ values: [], target: 5 })] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    if (last.type === 'done') expect(last.outcome).toBe('not-found');
  });
});

describe('binarySearch', () => {
  const sorted = [1, 2, 3, 5, 8, 9, 11, 15];

  it('finds the target', () => {
    const steps = [...binarySearch.run({ values: sorted, target: 5 })] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'found') {
      expect(sorted[last.foundIndex]).toBe(5);
    }
  });

  it('returns not-found for a missing value', () => {
    const steps = [...binarySearch.run({ values: sorted, target: 4 })] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    expect(last.type).toBe('done');
    if (last.type === 'done') expect(last.outcome).toBe('not-found');
  });

  it('handles empty array', () => {
    const steps = [...binarySearch.run({ values: [], target: 5 })] as ArrayAlgorithmStep[];
    const last = steps[steps.length - 1];
    if (last.type === 'done') expect(last.outcome).toBe('not-found');
  });

  it('accumulates eliminate-range to cover all indices on not-found', () => {
    const steps = [...binarySearch.run({ values: sorted, target: 4 })] as ArrayAlgorithmStep[];
    const eliminated = new Set<number>();
    steps
      .filter((s) => s.type === 'eliminate-range')
      .forEach((s) => {
        if (s.type === 'eliminate-range') s.indices.forEach((i) => eliminated.add(i));
      });
    expect(eliminated.size).toBe(sorted.length);
  });
});
