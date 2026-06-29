import { useMemo, useSyncExternalStore } from 'react';
import { AlgorithmEngine } from './AlgorithmEngine';
import type { AlgorithmDefinition } from '@/algorithms/shared/types';

/**
 * Wraps one AlgorithmEngine instance in React state. `useSyncExternalStore`
 * (not useState/useEffect) is the deliberate choice here: the engine is an
 * external, mutable object with its own subscribe/notify model — exactly
 * the case this hook exists for, and it avoids the extra render + effect
 * indirection that wiring it through useState would otherwise require.
 *
 * One instance per call. ComparePage (Phase 8) renders this hook twice —
 * independently — for its two side-by-side visualizations, which is the
 * direct payoff of keeping playback state out of the global Zustand store
 * (see architecture doc §6): no per-instance keying or namespacing needed.
 */
export function useAlgorithmEngine<TInput = number[]>() {
  const engine = useMemo(() => new AlgorithmEngine<TInput>(), []);

  // useSyncExternalStore re-renders the component whenever the
  // engine calls notify() (on any state change: step, play, pause,
  // initialize, etc). The snapshot getter just returns the engine
  // itself — a stable reference — since consumers read off its
  // getters (currentStep, progress, etc.) rather than expecting a
  // plain object snapshot.
  useSyncExternalStore(
    (onStoreChange) => engine.subscribe(onStoreChange),
    () => engine,
  );

  // All action callbacks are memoized off `engine` (itself stable for
  // the component's lifetime) rather than recreated on every render.
  // This matters beyond micro-optimization: consumers (e.g.
  // AlgorithmDetailPage) put `initialize` in a useEffect dependency
  // array to re-run only when the algorithm actually changes — if
  // these were fresh closures every render, that effect would fire
  // on every render instead, continuously re-randomizing the input.
  const actions = useMemo(
    () => ({
      initialize: (definition: AlgorithmDefinition<TInput>, input: TInput) =>
        engine.initialize(definition, input),
      play: (speed?: number) => engine.play(speed),
      pause: () => engine.pause(),
      stepForward: () => engine.stepForward(),
      stepBackward: () => engine.stepBackward(),
      jumpToStep: (index: number) => engine.jumpToStep(index),
      reset: () => engine.reset(),
      setSpeed: (speed: number) => engine.setSpeed(speed),
      randomizeInput: (size: number) => engine.randomizeInput(size),
    }),
    [engine],
  );

  return {
    engine,
    currentStep: engine.currentStep,
    stepsUpToCurrent: engine.stepsUpToCurrent,
    allSteps: engine.allSteps,
    progress: engine.progress,
    input: engine.input,
    speed: engine.speedMultiplier,
    ...actions,
  };
}
