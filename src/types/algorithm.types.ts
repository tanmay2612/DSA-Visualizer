/**
 * Domain types for algorithms. These are intentionally minimal in
 * Phase 1 — no algorithm logic exists yet. They exist now only so
 * that routing, constants, and UI components have a stable shape
 * to reference (category unions, metadata) without being rewritten
 * when the algorithm engine lands in Phase 2.
 */

export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graphs'
  | 'trees'
  | 'dynamic-programming'
  | 'backtracking'
  | 'greedy'
  | 'trie'
  | 'heap'
  | 'stack'
  | 'queue'
  | 'linked-list';

export type VisualizationType = 'array' | 'graph' | 'tree';

export type ComplexityNotation =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n^2)'
  | 'O(2^n)'
  | 'O(n!)'
  | 'O(V + E)'
  | 'O((V + E) log V)';

export interface AlgorithmComplexity {
  time: {
    best: ComplexityNotation;
    average: ComplexityNotation;
    worst: ComplexityNotation;
  };
  space: ComplexityNotation;
}

export type AlgorithmDifficulty = 'beginner' | 'intermediate' | 'advanced';
