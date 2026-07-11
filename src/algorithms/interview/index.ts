import type { InterviewProblemDefinition } from './types';
import { twoSum } from './twoSum';
import { maximumSubarray } from './maximumSubarray';
import { validParentheses } from './validParentheses';
import { bestTimeToBuySellStock } from './bestTimeToBuySellStock';

export * from './types';
export { twoSum } from './twoSum';
export { maximumSubarray } from './maximumSubarray';
export { validParentheses } from './validParentheses';
export { bestTimeToBuySellStock } from './bestTimeToBuySellStock';
export type { TwoSumInput } from './twoSum';

/**
 * Four of the six problems named in the phase brief are implemented
 * here (Two Sum, Maximum Subarray, Valid Parentheses, Best Time to
 * Buy and Sell Stock) — exactly the fallback subset the brief names
 * as the priority if all six can't be completed to a genuine
 * standard. Move Zeroes and Longest Common Prefix are P2 and are
 * not present in this array; see the phase report for why.
 */
export const interviewProblems: InterviewProblemDefinition<unknown>[] = [
  twoSum,
  maximumSubarray,
  validParentheses,
  bestTimeToBuySellStock,
] as InterviewProblemDefinition<unknown>[];

export function getInterviewProblemById(id: string): InterviewProblemDefinition<unknown> | undefined {
  return interviewProblems.find((problem) => problem.id === id);
}
