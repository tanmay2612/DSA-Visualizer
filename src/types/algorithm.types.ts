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
  | 'O(n!)';

export interface AlgorithmComplexity {
  time: {
    best: ComplexityNotation;
    average: ComplexityNotation;
    worst: ComplexityNotation;
  };
  space: ComplexityNotation;
}

/**
 * Metadata describing one algorithm for display purposes
 * (cards, detail pages, search). The `run` generator and full
 * `AlgorithmDefinition` interface (per the architecture doc)
 * are introduced in Phase 2 — Phase 1 only needs metadata to
 * populate category pages and navigation.
 */
export interface AlgorithmMeta {
  id: string;
  name: string;
  category: AlgorithmCategory;
  visualizationType: VisualizationType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  complexity: AlgorithmComplexity;
}
