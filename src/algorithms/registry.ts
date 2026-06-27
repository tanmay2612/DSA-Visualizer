import type { AlgorithmDefinition } from './shared/types';
import { sortingAlgorithms } from './sorting';

/**
 * Every algorithm from every category, flattened into one id-keyed
 * map. AlgorithmDetailPage looks up `:name` here — adding a new
 * category later means importing its barrel and spreading it into
 * this array, nothing else.
 */
const allAlgorithms: AlgorithmDefinition[] = [...sortingAlgorithms];

export const algorithmRegistry = new Map<string, AlgorithmDefinition>(
  allAlgorithms.map((algorithm) => [algorithm.id, algorithm]),
);

export function getAlgorithmById(id: string): AlgorithmDefinition | undefined {
  return algorithmRegistry.get(id);
}

export function getAlgorithmsByCategory(category: string): AlgorithmDefinition[] {
  return allAlgorithms.filter((algorithm) => algorithm.category === category);
}
