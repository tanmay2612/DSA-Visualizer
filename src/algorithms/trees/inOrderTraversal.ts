import type { AlgorithmDefinition, TreeAlgorithmStep, TreeNode } from '../shared/types';
import { createTreeNode, resetTreeNodeIds } from './shared/treeHelpers';

/**
 * Input is the sequence of values to build the tree from — the
 * tree itself is built silently (no yielded steps), then the
 * traversal over the FIXED resulting structure is what's actually
 * visualized. Unlike bstInsert/bstDelete, no `restructure` steps
 * occur here at all: traversal never changes the tree, only visits
 * it, mirroring BFS/DFS's "static structure, changing visual state
 * only" pattern from Phase 6, even though trees as a category lean
 * on the array-like full-snapshot pattern for the mutating
 * algorithms.
 */
export type InOrderTraversalInput = number[];

function buildTreeSilently(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const value of values) root = insertSilently(root, value);
  return root;
}

function insertSilently(root: TreeNode | null, value: number): TreeNode {
  if (!root) return createTreeNode(value);
  if (value < root.value) root.left = insertSilently(root.left, value);
  else if (value > root.value) root.right = insertSilently(root.right, value);
  return root;
}

/**
 * Visits left, then the node itself, then right — the defining
 * order of in-order traversal, and the reason it visits a BST's
 * values in ascending order: every value in a node's left subtree
 * is smaller, every value in its right subtree is larger, so
 * visiting left-self-right at every level produces a fully sorted
 * sequence overall.
 */
function* traverse(node: TreeNode | null, root: TreeNode | null): Generator<TreeAlgorithmStep> {
  if (!node) return;
  yield* traverse(node.left, root);
  yield { type: 'compare', nodeId: node.id, root };
  yield { type: 'mark-visited', nodeId: node.id, root };
  yield* traverse(node.right, root);
}

function* inOrderTraversalGenerator(input: InOrderTraversalInput): Generator<TreeAlgorithmStep> {
  resetTreeNodeIds();
  const root = buildTreeSilently(input);
  yield* traverse(root, root);
  yield { type: 'done', outcome: 'traversal', root };
}

function generateInOrderInput(size: number): InOrderTraversalInput {
  const values = new Set<number>();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 90) + 5);
  }
  return Array.from(values);
}

export const inOrderTraversal: AlgorithmDefinition<InOrderTraversalInput> = {
  id: 'in-order-traversal',
  name: 'In-Order Traversal',
  category: 'trees',
  visualizationType: 'tree',
  difficulty: 'beginner',
  description:
    'Visits a binary search tree\u2019s left subtree, then the node itself, then its right subtree — visiting every value in ascending sorted order.',
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  pseudocode: [
    'inOrder(node):',
    '  if node is null: return',
    '  inOrder(node.left)',
    '  visit(node)',
    '  inOrder(node.right)',
  ],
  generateRandomInput: generateInOrderInput,
  run: inOrderTraversalGenerator,
};
