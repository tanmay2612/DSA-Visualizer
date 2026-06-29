import type { AlgorithmDefinition } from '../shared/types';
import { linearSearch } from './linearSearch';
import { binarySearch } from './binarySearch';

/**
 * Searching category registry. Unlike sorting (every algorithm
 * takes plain number[]), linear/binary search take a richer
 * `SearchInput` (`{ values, target }`) — they need something to
 * search FOR, not just something to search through. Erasing to
 * `AlgorithmDefinition<unknown>` here is intentional and safe: this
 * array is storage/lookup only (the registry never calls
 * `generateRandomInput` or `run` itself), and the page that
 * eventually does call them re-narrows to the specific input type
 * it knows it's dealing with at that point — see registry.ts and
 * AlgorithmDetailPage for why this boundary is where erasure
 * happens, not earlier.
 */
export const searchingAlgorithms: AlgorithmDefinition<unknown>[] = [
  linearSearch as AlgorithmDefinition<unknown>,
  binarySearch as AlgorithmDefinition<unknown>,
];
