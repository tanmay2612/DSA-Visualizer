import { describe, it, expect } from 'vitest';
import { arrayAdapter } from '@/engine/adapters/arrayAdapter';
import type { ArrayAlgorithmStep } from '@/algorithms/shared/types';
import { AlgorithmEngine } from '@/engine/AlgorithmEngine';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { mergeSort } from '@/algorithms/sorting/mergeSort';
import type { SearchInput } from '@/algorithms/searching/linearSearch';
import { binarySearch } from '@/algorithms/searching/binarySearch';

function tagged(values: number[]) {
  return values.map((value, id) => ({ id, value }));
}

const BASE = tagged([5, 2, 8, 1, 9]);

describe('arrayAdapter', () => {
  describe('empty history', () => {
    it('returns empty elements with no fallback', () => {
      const scene = arrayAdapter([]);
      expect(scene.type).toBe('array');
      expect(scene.elements).toHaveLength(0);
    });

    it('uses allSteps[0].array with default state as fallback', () => {
      const allSteps: ArrayAlgorithmStep[] = [{ type: 'compare', indices: [0, 1], array: BASE }];
      const scene = arrayAdapter([], allSteps);
      expect(scene.elements).toHaveLength(5);
      expect(scene.elements.every((e) => e.state === 'default')).toBe(true);
    });
  });

  describe('transient highlights', () => {
    it('marks compared indices', () => {
      const steps: ArrayAlgorithmStep[] = [{ type: 'compare', indices: [0, 1], array: BASE }];
      const scene = arrayAdapter(steps);
      expect(scene.elements[0].state).toBe('compare');
      expect(scene.elements[1].state).toBe('compare');
      expect(scene.elements[2].state).toBe('default');
    });

    it('marks swapped indices', () => {
      const steps: ArrayAlgorithmStep[] = [{ type: 'swap', indices: [1, 3], array: BASE }];
      const scene = arrayAdapter(steps);
      expect(scene.elements[1].state).toBe('swap');
      expect(scene.elements[3].state).toBe('swap');
    });
  });

  describe('mark-sorted accumulation', () => {
    it('persists sorted state across subsequent steps', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'mark-sorted', indices: [4], array: BASE },
        { type: 'compare', indices: [0, 1], array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements[4].state).toBe('sorted');
      expect(scene.elements[0].state).toBe('compare');
    });

    it('clears sorted mark when a later swap touches that index (Phase 4 merge-sort bug)', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'mark-sorted', indices: [0, 1], array: BASE },
        { type: 'swap', indices: [0, 2], array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements[0].state).toBe('swap');
      expect(scene.elements[1].state).toBe('sorted');
    });

    it('clears sorted mark when a later overwrite touches that index', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'mark-sorted', indices: [2], array: BASE },
        { type: 'overwrite', index: 2, array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements[2].state).toBe('swap');
    });
  });

  describe('eliminate-range accumulation', () => {
    it('accumulates eliminated indices permanently', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'eliminate-range', indices: [0, 1, 2], array: BASE },
        { type: 'compare-target', index: 3, targetValue: 8, array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements[0].state).toBe('eliminated');
      expect(scene.elements[1].state).toBe('eliminated');
      expect(scene.elements[2].state).toBe('eliminated');
      expect(scene.elements[3].state).toBe('compare');
    });
  });

  describe('done outcome discrimination (Phase 5 bug)', () => {
    it('marks all sorted for outcome sort', () => {
      const steps: ArrayAlgorithmStep[] = [{ type: 'done', outcome: 'sort', array: BASE }];
      const scene = arrayAdapter(steps);
      expect(scene.elements.every((e) => e.state === 'sorted')).toBe(true);
    });

    it('marks only foundIndex for outcome found', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'done', outcome: 'found', foundIndex: 2, array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements[2].state).toBe('found');
      expect(scene.elements[0].state).not.toBe('sorted');
    });

    it('preserves eliminated state for outcome not-found (Phase 5 regression)', () => {
      const steps: ArrayAlgorithmStep[] = [
        { type: 'eliminate-range', indices: [0, 1, 2, 3, 4], array: BASE },
        { type: 'done', outcome: 'not-found', array: BASE },
      ];
      const scene = arrayAdapter(steps);
      expect(scene.elements.every((e) => e.state === 'eliminated')).toBe(true);
      expect(scene.elements.some((e) => e.state === 'sorted')).toBe(false);
    });
  });

  describe('end-to-end', () => {
    it('bubble sort produces all sorted elements', () => {
      const engine = new AlgorithmEngine<number[]>();
      engine.initialize(bubbleSort, [5, 2, 8, 1, 9]);
      while (!engine.isFinished) engine.stepForward();
      const scene = arrayAdapter(
        engine.stepsUpToCurrent as ArrayAlgorithmStep[],
        engine.allSteps as ArrayAlgorithmStep[],
      );
      expect(scene.elements.every((e) => e.state === 'sorted')).toBe(true);
      expect(scene.elements.map((e) => e.value)).toEqual([1, 2, 5, 8, 9]);
    });

    it('merge sort handles sorted-mark clearing (Phase 4 regression)', () => {
      const engine = new AlgorithmEngine<number[]>();
      engine.initialize(mergeSort, [5, 2, 8, 1, 9, 3]);
      while (!engine.isFinished) engine.stepForward();
      const scene = arrayAdapter(
        engine.stepsUpToCurrent as ArrayAlgorithmStep[],
        engine.allSteps as ArrayAlgorithmStep[],
      );
      expect(scene.elements.every((e) => e.state === 'sorted')).toBe(true);
    });

    it('binary search not-found shows eliminated not sorted (Phase 5 regression)', () => {
      const engine = new AlgorithmEngine<SearchInput>();
      engine.initialize(binarySearch, { values: [1, 2, 3, 5, 8, 9], target: 4 });
      while (!engine.isFinished) engine.stepForward();
      const scene = arrayAdapter(
        engine.stepsUpToCurrent as ArrayAlgorithmStep[],
        engine.allSteps as ArrayAlgorithmStep[],
      );
      expect(scene.elements.some((e) => e.state === 'eliminated')).toBe(true);
      expect(scene.elements.some((e) => e.state === 'sorted')).toBe(false);
    });
  });
});
