import { describe, expect, it } from 'vitest';
import { twoSum } from './twoSum';
import { maximumSubarray } from './maximumSubarray';
import { validParentheses } from './validParentheses';
import { bestTimeToBuySellStock } from './bestTimeToBuySellStock';
import type { AlgorithmStep } from '../shared/types';

function drainFinal(steps: Generator<AlgorithmStep>): AlgorithmStep {
  let last: AlgorithmStep | undefined;
  for (const step of steps) last = step;
  if (!last) throw new Error('generator produced no steps');
  return last;
}

describe('Two Sum', () => {
  it('finds the correct index pair (mandatory acceptance test 3: [2,7,11,15], target 9 -> [0,1])', () => {
    const last = drainFinal(twoSum.run({ array: [2, 7, 11, 15], target: 9 }));
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.indices).toEqual([0, 1]);
    } else {
      throw new Error('expected a result outcome');
    }
  });

  it('reports no pair found when none sums to target', () => {
    const last = drainFinal(twoSum.run({ array: [1, 2, 3], target: 100 }));
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.indices).toEqual([]);
    }
  });

  it("never reuses the same element twice (doesn't match target = 2*array[i] against itself)", () => {
    const last = drainFinal(twoSum.run({ array: [4, 1, 2], target: 8 }));
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.indices).toEqual([]);
    }
  });
});

describe("Maximum Subarray (Kadane's Algorithm)", () => {
  it('finds the classic example: [-2,1,-3,4,-1,2,1,-5,4] -> sum 6', () => {
    const last = drainFinal(maximumSubarray.run([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.resultLabel).toContain('6');
    }
  });

  it('handles an all-negative array (best subarray is the single largest element)', () => {
    const last = drainFinal(maximumSubarray.run([-5, -2, -8, -1, -9]));
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.resultLabel).toContain('-1');
    }
  });

  it('handles a single-element array', () => {
    const last = drainFinal(maximumSubarray.run([7]));
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.indices).toEqual([0]);
    }
  });
});

describe('Valid Parentheses', () => {
  it.each([
    ['()', true],
    ['()[]{}', true],
    ['{[]}', true],
    ['({[]})', true],
    ['(]', false],
    ['([)]', false],
    ['(((', false],
    ['{[}]', false],
    [')', false],
  ])('evaluates "%s" as valid=%s', (input, expectedValid) => {
    const last = drainFinal(validParentheses.run(input));
    expect(last.type).toBe('done');
    if (last.type === 'done' && last.outcome === 'result') {
      const isValid = last.resultLabel.startsWith('Valid');
      expect(isValid).toBe(expectedValid);
    }
  });
});

describe('Best Time to Buy and Sell Stock', () => {
  it('finds max profit for the classic example: [7,1,5,3,6,4] -> 5', () => {
    const last = drainFinal(bestTimeToBuySellStock.run([7, 1, 5, 3, 6, 4]));
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.resultLabel).toContain('5');
      expect(last.indices).toEqual([1, 4]);
    }
  });

  it('returns no profitable trade when prices strictly decrease', () => {
    const last = drainFinal(bestTimeToBuySellStock.run([9, 7, 5, 3, 1]));
    if (last.type === 'done' && last.outcome === 'result') {
      expect(last.indices).toEqual([]);
      expect(last.resultLabel).toContain('No profitable trade');
    }
  });
});
