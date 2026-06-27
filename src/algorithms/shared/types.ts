/**
 * Pure algorithm-engine types. This file (and everything else in
 * `algorithms/`) must never import from React, Framer Motion, or
 * any `components/` path. Algorithms speak in plain data; the
 * engine and adapters translate that into something renderable.
 *
 * `AlgorithmStep` is a discriminated union. Each visualization type
 * (array/graph/tree) only ever produces a subset of these — the
 * `array` shape below is the only one implemented in Phase 2.
 * Graph and tree step shapes are added in Phases 6/7 without
 * touching this file's existing members or any array-algorithm code.
 */

import type { ComplexityNotation, VisualizationType } from '@/types/algorithm.types';

/** Steps produced by array-based algorithms (sorting, searching). */
export type ArrayAlgorithmStep =
  | { type: 'compare'; indices: [number, number]; array: number[] }
  | { type: 'swap'; indices: [number, number]; array: number[] }
  | { type: 'overwrite'; index: number; value: number; array: number[] }
  | { type: 'mark-sorted'; indices: number[]; array: number[] }
  | { type: 'done'; array: number[] };

// Graph/tree step unions land in Phases 6/7. AlgorithmStep is kept
// as an alias (not a hardcoded equal to ArrayAlgorithmStep) so that
// adding `| GraphAlgorithmStep` later is a one-line change here,
// not a refactor of every file that imports AlgorithmStep.
export type AlgorithmStep = ArrayAlgorithmStep;

export type StepType = AlgorithmStep['type'];

/**
 * Full algorithm definition — the contract every algorithm
 * implementation satisfies. Note `run` is the *only* logic method;
 * play/pause/step/reset are deliberately NOT part of this interface
 * (see AlgorithmEngine) because that playback behavior is identical
 * across every algorithm and shouldn't be reimplemented per file.
 */
export interface AlgorithmDefinition<TInput = number[]> {
  id: string;
  name: string;
  category: string;
  visualizationType: VisualizationType;
  complexity: {
    time: { best: ComplexityNotation; average: ComplexityNotation; worst: ComplexityNotation };
    space: ComplexityNotation;
  };
  /** Pseudocode lines, rendered by PseudocodeViewer in a later phase. */
  pseudocode: string[];
  /** Produces a random input of the requested size for this algorithm. */
  generateRandomInput: (size: number) => TInput;
  /** The algorithm itself. Pure generator — no side effects beyond yielding steps. */
  run: (input: TInput) => Generator<AlgorithmStep, void, unknown>;
}
