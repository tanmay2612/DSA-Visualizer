import type { ArrayAlgorithmStep, ArrayElement } from '../shared/types';
import type { InterviewProblemDefinition } from './types';

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const OPENERS = new Set(['(', '[', '{']);

/** Represents each character as a fixed, uniform-height ArrayElement
 *  (value: 1) whose `label` is the actual bracket — bar height is
 *  meaningless for a string, so every bar is drawn the same height
 *  and only the label underneath (and its highlight color) carries
 *  information. See ArrayElement.label's doc comment for why this
 *  field exists. */
function tagChars(input: string): ArrayElement[] {
  return input.split('').map((char, id) => ({ id, value: 1, label: char }));
}

/**
 * Classic stack approach, adapted to the array-step vocabulary
 * instead of an actually-shrinking/growing visual stack: the input
 * string's characters stay at fixed positions the whole run, and a
 * plain JS array (`stack`, holding *indices* of unmatched openers)
 * tracks stack state internally. `mark-sorted` — normally sorting's
 * "permanently settled" marker — is reused here for "confirmed
 * matched pair," which fits its accumulating-highlight semantics
 * (see arrayAdapter) exactly: once two brackets match, they stay
 * highlighted for the rest of the run, the same way a sorted
 * position never becomes unsorted.
 */
function* validParenthesesGenerator(input: string): Generator<ArrayAlgorithmStep> {
  const arr = tagChars(input);
  const stack: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    yield { type: 'mark-active', index: i, array: [...arr] };
    const char = arr[i].label as string;

    if (OPENERS.has(char)) {
      stack.push(i);
      continue;
    }

    const expectedOpener = PAIRS[char];
    if (expectedOpener === undefined) continue; // non-bracket char: ignore

    const topIndex = stack.length > 0 ? stack[stack.length - 1] : -1;

    if (topIndex === -1 || arr[topIndex].label !== expectedOpener) {
      yield { type: 'mark-result', indices: [i], array: [...arr] };
      yield {
        type: 'done',
        array: [...arr],
        outcome: 'result',
        indices: [i],
        resultLabel: `Invalid — unexpected "${char}" at position ${i}.`,
      };
      return;
    }

    yield { type: 'compare', indices: [topIndex, i], array: [...arr] };
    stack.pop();
    yield { type: 'mark-sorted', indices: [topIndex, i], array: [...arr] };
  }

  if (stack.length > 0) {
    yield { type: 'mark-result', indices: stack, array: [...arr] };
    yield {
      type: 'done',
      array: [...arr],
      outcome: 'result',
      indices: stack,
      resultLabel: `Invalid — ${stack.length} unclosed bracket${stack.length === 1 ? '' : 's'}.`,
    };
    return;
  }

  yield {
    type: 'done',
    array: [...arr],
    outcome: 'result',
    indices: [],
    resultLabel: 'Valid — every bracket is properly matched and closed.',
  };
}

const SAMPLE_VALID = ['()', '()[]{}', '{[]}', '({[]})'];
const SAMPLE_INVALID = ['(]', '([)]', '(((', '{[}]'];

export const validParentheses: InterviewProblemDefinition<string> = {
  id: 'valid-parentheses',
  name: 'Valid Parentheses',
  category: 'interview',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Determine whether a string of brackets is valid: every opening bracket is closed by the same type, in the correct order.',
  topics: ['Stack', 'String'],
  problemStatement:
    'Given a string containing only the characters (){}[], determine if the input is valid. Brackets must close in the correct order and every opening bracket must have a matching closing bracket.',
  example: {
    input: '"{[]}"',
    output: 'true',
    explanation: 'Each opening bracket is closed by the matching type, innermost first.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  pseudocode: [
    'stack = []',
    'for char in string:',
    '  if char is an opening bracket:',
    '    push char onto stack',
    '  else:',
    '    if stack is empty or stack.pop() does not match char:',
    '      return false',
    'return stack is empty',
  ],
  pseudocodeLineMap: {
    'mark-active': 1,
    compare: 5,
    'mark-sorted': 5,
  },
  generateRandomInput: () => {
    const pool = Math.random() < 0.5 ? SAMPLE_VALID : SAMPLE_INVALID;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  run: validParenthesesGenerator,
};
