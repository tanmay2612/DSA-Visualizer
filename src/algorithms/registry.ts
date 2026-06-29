import type { AlgorithmDefinition } from './shared/types';
import { sortingAlgorithms } from './sorting';
import { searchingAlgorithms } from './searching';
import { graphAlgorithms } from './graphs';
import { treeAlgorithms } from './trees';

/**
 * Every algorithm from every category, flattened into one id-keyed
 * map. AlgorithmDetailPage looks up `:name` here — adding a new
 * category later means importing its barrel and spreading it into
 * this array, nothing else.
 *
 * Widened to `AlgorithmDefinition<unknown>` here, at the point
 * sorting (TInput = number[]) and searching/graphs/trees (each with
 * their own richer input shapes) combine into one heterogeneous
 * list — this registry only ever stores and looks up definitions,
 * never calls `generateRandomInput` or `run` itself, so it never
 * actually needs to know each entry's specific input shape. The
 * page that does call them re-narrows to the type it knows it's
 * dealing with at that point (see AlgorithmDetailPage).
 */
const allAlgorithms: AlgorithmDefinition<unknown>[] = [
  ...(sortingAlgorithms as AlgorithmDefinition<unknown>[]),
  ...searchingAlgorithms,
  ...graphAlgorithms,
  ...treeAlgorithms,
];

export const algorithmRegistry = new Map<string, AlgorithmDefinition<unknown>>(
  allAlgorithms.map((algorithm) => [algorithm.id, algorithm]),
);

export function getAlgorithmById(id: string): AlgorithmDefinition<unknown> | undefined {
  return algorithmRegistry.get(id);
}

export function getAlgorithmsByCategory(category: string): AlgorithmDefinition<unknown>[] {
  return allAlgorithms.filter((algorithm) => algorithm.category === category);
}

export function getAllAlgorithms(): AlgorithmDefinition<unknown>[] {
  return allAlgorithms;
}
