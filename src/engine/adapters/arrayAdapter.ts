import type { ArrayAlgorithmStep, ArrayElement } from '@/algorithms/shared/types';
import type { ArraySceneDescription, ElementVisualState } from '@/types/visualization.types';

/**
 * Converts the algorithm's step history up to and including the
 * current step into a renderable scene.
 *
 * `stepsUpToCurrent` is `[]` when the engine is at its initial,
 * pre-playback position (currentIndex === -1 — see
 * AlgorithmEngine.stepsUpToCurrent). For that case, `allSteps[0]`
 * (always present once an algorithm has been initialized) supplies
 * the untouched initial array's ids+values — but deliberately NOT
 * its highlighting: `allSteps[0]` is itself a `compare`/
 * `compare-target` step in every algorithm written so far, and
 * nothing should look "already being compared" before the user has
 * taken any action. This is why the fallback branch below maps to
 * `'default'` explicitly rather than reusing the normal per-step
 * switch logic.
 *
 * An earlier version of this function took a `rawInput: number[]`
 * parameter for this same fallback case, but that broke once
 * searching algorithms arrived with a non-`number[]` TInput — there
 * was no type-safe way to pass "the raw input" generically. Taking
 * `allSteps` (always `ArrayElement[]`-shaped, regardless of which
 * algorithm or TInput produced it) instead of the raw input sidesteps
 * that problem entirely: every step, from every algorithm, carries
 * the same array shape, so this fallback needs no per-algorithm
 * knowledge at all.
 *
 * IMPORTANT: this takes the full step history, not just the
 * current step. "Sorted" is a state that accumulates — once index
 * 5 is marked sorted on pass 1, it must stay visually sorted
 * through every later pass's compare/swap highlighting, even
 * though those later steps don't re-mention index 5 — UNLESS a
 * later swap or overwrite touches index 5 again, in which case it's
 * no longer in its final position and the sorted mark is cleared.
 * (Comparison sorts never revisit a sorted index, so this never
 * triggers for them; merge sort's parent merges do revisit indices
 * a child merge already finished, which is exactly the case this
 * exists for.) "Eliminated" (binary search) accumulates the same
 * way but with no un-marking case — once a range is eliminated from
 * consideration, the algorithm never revisits it. A version of this
 * adapter that only looked at the current step would lose all
 * accumulated state on the very next step. Re-deriving the full
 * sorted/eliminated sets from history each call keeps this function
 * pure and stateless rather than needing the engine to track that
 * as separate mutable state.
 *
 * `done` branches on its `outcome` tag: 'sort' marks the whole
 * array sorted; 'found' marks only `foundIndex` as found while
 * preserving other accumulated state; 'not-found' preserves
 * accumulated state (e.g. binary search's eliminated ranges)
 * without marking anything new. See shared/types.ts for why this
 * needed to be an explicit tag rather than inferred from whether
 * foundIndex was present — the inferred version had a real bug.
 *
 * Every returned element carries the same `id` the algorithm
 * assigned it (see shared/arrayElements.ts) — the adapter never
 * invents or reassigns ids, only forwards them, so the canvas can
 * key bars by identity and animate swaps as physical movement.
 */
export function arrayAdapter(
  stepsUpToCurrent: ArrayAlgorithmStep[],
  allSteps: ArrayAlgorithmStep[] = [],
): ArraySceneDescription {
  if (stepsUpToCurrent.length === 0) {
    const initialElements = allSteps[0]?.array ?? [];
    return {
      type: 'array',
      elements: initialElements.map((element) => ({ ...element, state: 'default' })),
    };
  }

  const currentStep = stepsUpToCurrent[stepsUpToCurrent.length - 1];
  const elements = currentStep.array;

  // Accumulate "sorted" status across history, but — critically —
  // in chronological order, removing an index from the sorted set
  // if a LATER swap/overwrite touches it again. This matters for
  // merge sort: a leaf-level merge can mark indices [0,1] sorted,
  // but a later parent merge rewrites those same positions with
  // different values entirely. Without un-marking on rewrite, those
  // bars would incorrectly stay green ("sorted") while still being
  // actively overwritten by an ancestor merge call. Verified this
  // was a real, observable bug (not just theoretical) before fixing.
  //
  // This is safe for the simpler comparison sorts too (bubble,
  // selection, insertion): once one of them marks an index sorted,
  // nothing in those algorithms ever swaps or overwrites that index
  // again, so the removal branch is simply never triggered for them.
  const sortedIndices = new Set<number>();
  // Eliminated ranges (binary search) accumulate with no un-marking
  // case: once a half is eliminated from consideration, the
  // algorithm never revisits it, unlike merge sort's sorted regions.
  const eliminatedIndices = new Set<number>();
  for (const step of stepsUpToCurrent) {
    if (step.type === 'mark-sorted') {
      step.indices.forEach((index) => sortedIndices.add(index));
    } else if (step.type === 'swap') {
      sortedIndices.delete(step.indices[0]);
      sortedIndices.delete(step.indices[1]);
    } else if (step.type === 'overwrite') {
      sortedIndices.delete(step.index);
    } else if (step.type === 'eliminate-range') {
      step.indices.forEach((index) => eliminatedIndices.add(index));
    }
  }

  const states: ElementVisualState[] = elements.map((_, index) => {
    if (sortedIndices.has(index)) return 'sorted';
    if (eliminatedIndices.has(index)) return 'eliminated';
    return 'default';
  });

  // Highlight the current step's specific focus on top of the
  // accumulated sorted/eliminated state — comparisons/swaps take
  // visual priority for the indices they touch, even if those
  // indices happen to already be marked sorted (shouldn't normally
  // co-occur, but a later algorithm could revisit a sorted region).
  switch (currentStep.type) {
    case 'compare':
      states[currentStep.indices[0]] = 'compare';
      states[currentStep.indices[1]] = 'compare';
      break;
    case 'compare-target':
      states[currentStep.index] = 'compare';
      break;
    case 'swap':
      states[currentStep.indices[0]] = 'swap';
      states[currentStep.indices[1]] = 'swap';
      break;
    case 'overwrite':
      states[currentStep.index] = 'swap';
      break;
    case 'mark-active':
      states[currentStep.index] = 'visited';
      break;
    case 'found':
      states[currentStep.index] = 'found';
      break;
    case 'mark-result':
      currentStep.indices.forEach((index) => {
        states[index] = 'found';
      });
      break;
    case 'done':
      // See ArrayAlgorithmStep's doc comment in shared/types.ts for
      // why `outcome` is an explicit tag rather than inferred from
      // foundIndex's presence — the inferred version had a real bug
      // where a search's not-found completion incorrectly reused
      // the sort's "mark everything sorted" behavior, discarding
      // the accumulated eliminated-range state instead of keeping it.
      switch (currentStep.outcome) {
        case 'sort':
          return {
            type: 'array',
            elements: elements.map((element) => ({ ...element, state: 'sorted' })),
          };
        case 'found':
          return {
            type: 'array',
            elements: elements.map((element, index) => ({
              ...element,
              state: index === currentStep.foundIndex ? 'found' : states[index],
            })),
          };
        case 'not-found':
          // Preserve whatever accumulated state already exists
          // (e.g. binary search's eliminated ranges) — a not-found
          // result makes no claim about sortedness and shouldn't
          // erase the visual history that led to "not found".
          break;
        case 'result':
          // Interview-problem completion: mark only the answer's
          // indices as found, preserving whatever accumulated state
          // (mark-active highlights don't accumulate, so there's
          // normally nothing to preserve here, but this stays
          // consistent with 'not-found''s preserve-don't-overwrite
          // approach rather than assuming array-wide state).
          return {
            type: 'array',
            elements: elements.map((element, index) => ({
              ...element,
              state: currentStep.indices.includes(index) ? 'found' : states[index],
            })),
          };
      }
      break;
    case 'mark-sorted':
    case 'eliminate-range':
      // Already folded into the accumulated sets above; nothing
      // extra to layer on for these step types.
      break;
    default: {
      // Exhaustiveness check: if a new ArrayAlgorithmStep variant is
      // added to the union without a corresponding case above, this
      // line fails to compile (currentStep wouldn't be assignable to
      // `never`) instead of silently falling through with that
      // step's highlight never applied. Caught a near-miss of exactly
      // this kind when `mark-active` was added — TS didn't complain
      // even though the switch was missing it, since there was no
      // exhaustiveness guard at the time.
      const exhaustiveCheck: never = currentStep;
      void exhaustiveCheck;
    }
  }

  return {
    type: 'array',
    elements: elements.map((element: ArrayElement, index) => ({
      ...element,
      state: states[index],
    })),
  };
}
