import type { AlgorithmDefinition } from '../shared/types';
import { bstInsert } from './bstInsert';
import { bstDelete } from './bstDelete';
import { inOrderTraversal } from './inOrderTraversal';

/**
 * Trees category registry. `bstInsert` takes a plain value
 * sequence; `bstDelete` takes `{ valuesToBuild, valueToDelete }`;
 * `inOrderTraversal` takes a plain value sequence again — three
 * algorithms, three different relationships to "what counts as
 * input," same erasure-at-the-registry-boundary pattern as
 * searching/index.ts and graphs/index.ts.
 */
export const treeAlgorithms: AlgorithmDefinition<unknown>[] = [
  bstInsert as AlgorithmDefinition<unknown>,
  bstDelete as AlgorithmDefinition<unknown>,
  inOrderTraversal as AlgorithmDefinition<unknown>,
];
