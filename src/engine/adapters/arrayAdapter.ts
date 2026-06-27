import type { ArrayAlgorithmStep } from '@/algorithms/shared/types';
import type { ArraySceneDescription, ElementVisualState } from '@/types/visualization.types';

/**
 * Converts the algorithm's step history up to and including the
 * current step (or `null` / an empty history, meaning "show the
 * raw input") into a renderable scene.
 *
 * IMPORTANT: this takes the full step history, not just the
 * current step. "Sorted" is a state that accumulates — once index
 * 5 is marked sorted on pass 1, it must stay visually sorted
 * through every later pass's compare/swap highlighting, even
 * though those later steps don't re-mention index 5. A version of
 * this adapter that only looked at the current step would lose
 * that accumulated state on the very next step. Re-deriving the
 * full sorted set from history each call keeps this function pure
 * and stateless rather than needing the engine to track "sorted
 * indices so far" as separate mutable state.
 */
export function arrayAdapter(
  stepsUpToCurrent: ArrayAlgorithmStep[],
  rawInput: number[],
): ArraySceneDescription {
  if (stepsUpToCurrent.length === 0) {
    return {
      type: 'array',
      elements: rawInput.map((value) => ({ value, state: 'default' })),
    };
  }

  const currentStep = stepsUpToCurrent[stepsUpToCurrent.length - 1];
  const values = currentStep.array;

  // Accumulate every index ever marked sorted across the whole
  // history so far (including by an earlier 'done', defensively).
  const sortedIndices = new Set<number>();
  for (const step of stepsUpToCurrent) {
    if (step.type === 'mark-sorted') {
      step.indices.forEach((index) => sortedIndices.add(index));
    }
  }

  const states: ElementVisualState[] = values.map((_, index) =>
    sortedIndices.has(index) ? 'sorted' : 'default',
  );

  // Highlight the current step's specific focus on top of the
  // accumulated sorted state — comparisons/swaps take visual
  // priority for the indices they touch, even if those indices
  // happen to already be marked sorted (shouldn't normally
  // co-occur, but a later algorithm could revisit a sorted region).
  switch (currentStep.type) {
    case 'compare':
      states[currentStep.indices[0]] = 'compare';
      states[currentStep.indices[1]] = 'compare';
      break;
    case 'swap':
      states[currentStep.indices[0]] = 'swap';
      states[currentStep.indices[1]] = 'swap';
      break;
    case 'overwrite':
      states[currentStep.index] = 'swap';
      break;
    case 'done':
      // Every element is sorted by definition once the algorithm
      // reports done, regardless of which mark-sorted events fired.
      return {
        type: 'array',
        elements: values.map((value) => ({ value, state: 'sorted' })),
      };
    case 'mark-sorted':
      // Already folded into `sortedIndices` above; nothing extra
      // to layer on for this step type.
      break;
  }

  return {
    type: 'array',
    elements: values.map((value, index) => ({ value, state: states[index] })),
  };
}
