import type { AlgorithmDefinition, TreeAlgorithmStep, TreeNode } from '../shared/types';
import { cloneTree, createTreeNode, resetTreeNodeIds } from './shared/treeHelpers';

/**
 * Input is a pre-built sequence of values to insert (forming the
 * starting tree) plus the one value to delete from it. Unlike
 * `BstInsertInput` (just the sequence), delete needs a tree to
 * delete FROM — `valuesToBuild` constructs it, `valueToDelete` is
 * the operation actually being visualized. Building the starting
 * tree happens silently (no yielded steps) — only the delete
 * operation itself is what this algorithm demonstrates.
 */
export interface BstDeleteInput {
  valuesToBuild: number[];
  valueToDelete: number;
}

function buildTreeSilently(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const value of values) {
    root = insertSilently(root, value);
  }
  return root;
}

function insertSilently(root: TreeNode | null, value: number): TreeNode {
  if (!root) return createTreeNode(value);
  if (value < root.value) root.left = insertSilently(root.left, value);
  else if (value > root.value) root.right = insertSilently(root.right, value);
  return root;
}

/** Finds the in-order successor (leftmost node of the right
 *  subtree) — the conventional replacement for a deleted node that
 *  has two children, since it's guaranteed to be greater than
 *  everything in the left subtree and less than everything else in
 *  the right subtree, preserving the BST invariant. */
function findMin(node: TreeNode): TreeNode {
  let current = node;
  while (current.left) current = current.left;
  return current;
}

function* deleteValue(
  root: TreeNode | null,
  value: number,
): Generator<TreeAlgorithmStep, TreeNode | null> {
  if (!root) return null;

  yield { type: 'compare', nodeId: root.id, root };

  if (value < root.value) {
    root.left = yield* deleteValue(root.left, value);
    return root;
  }
  if (value > root.value) {
    root.right = yield* deleteValue(root.right, value);
    return root;
  }

  // Found the node to delete.
  if (!root.left && !root.right) {
    return null; // leaf: simply remove it
  }
  if (!root.left) {
    return root.right; // one child: replace with the child
  }
  if (!root.right) {
    return root.left;
  }

  // Two children: replace this node's value with its in-order
  // successor's value, then delete the successor from the right
  // subtree (which is now a simpler one-child-or-leaf case).
  const successor = findMin(root.right);
  yield { type: 'compare', nodeId: successor.id, root };
  root.value = successor.value;
  root.right = yield* deleteValue(root.right, successor.value);
  return root;
}

function* bstDeleteGenerator(input: BstDeleteInput): Generator<TreeAlgorithmStep> {
  resetTreeNodeIds();
  const initialRoot = buildTreeSilently(input.valuesToBuild);

  // Clone before the visualized portion begins, so the working
  // copy can be freely mutated without affecting `initialRoot`
  // (not yielded anywhere, but kept clean as a matter of the same
  // "snapshots are independent" discipline used everywhere else).
  const workingRoot = cloneTree(initialRoot);
  const exists = input.valuesToBuild.includes(input.valueToDelete);

  if (!exists) {
    yield { type: 'done', outcome: 'mutation', root: workingRoot };
    return;
  }

  const newRoot = yield* deleteValue(workingRoot, input.valueToDelete);
  yield { type: 'restructure', root: newRoot };
  yield { type: 'done', outcome: 'mutation', root: newRoot };
}

function generateBstDeleteInput(size: number): BstDeleteInput {
  const values = new Set<number>();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 90) + 5);
  }
  const valuesToBuild = Array.from(values);
  const valueToDelete = valuesToBuild[Math.floor(Math.random() * valuesToBuild.length)];
  return { valuesToBuild, valueToDelete };
}

export const bstDelete: AlgorithmDefinition<BstDeleteInput> = {
  id: 'bst-delete',
  name: 'BST Delete',
  category: 'trees',
  visualizationType: 'tree',
  difficulty: 'advanced',
  description:
    'Removes a value from a binary search tree, handling leaf nodes, single-child nodes, and two-child nodes (via in-order successor) differently.',
  complexity: {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  pseudocode: [
    'delete(root, value):',
    '  if root is null: return null',
    '  if value < root.value: root.left = delete(root.left, value)',
    '  else if value > root.value: root.right = delete(root.right, value)',
    '  else:',
    '    if root has no children: return null',
    '    if root has one child: return that child',
    '    successor = min(root.right)',
    '    root.value = successor.value',
    '    root.right = delete(root.right, successor.value)',
    '  return root',
  ],
  generateRandomInput: generateBstDeleteInput,
  run: bstDeleteGenerator,
};
