import type { AlgorithmDefinition } from '../shared/types';
import { bfs } from './bfs';
import { dfs } from './dfs';
import { dijkstra } from './dijkstra';

/**
 * Graphs category registry. BFS/DFS share `GraphTraversalInput`;
 * Dijkstra uses the richer `ShortestPathInput` (it needs a target,
 * not just a start). Same erasure-at-the-registry-boundary pattern
 * as searching/index.ts — see that file's comment for the full
 * reasoning (registry storage/lookup never needs the specific input
 * shape; only the page that calls run()/generateRandomInput does).
 */
export const graphAlgorithms: AlgorithmDefinition<unknown>[] = [
  bfs as AlgorithmDefinition<unknown>,
  dfs as AlgorithmDefinition<unknown>,
  dijkstra as AlgorithmDefinition<unknown>,
];
