import type { AlgorithmDefinition } from '../shared/types';
import { bubbleSort } from './bubbleSort';

/**
 * Sorting category registry. Phase 4 adds merge/quick/insertion/
 * selection/heap sort here — each is one new file plus one line
 * added to this array, with zero changes to the engine or canvas.
 */
export const sortingAlgorithms: AlgorithmDefinition<number[]>[] = [bubbleSort];
