import type { AlgorithmDefinition, TreeAlgorithmStep, TreeNode } from '../shared/types';
import { cloneTree, createTreeNode, resetTreeNodeIds } from './shared/treeHelpers';

/**
 * Input is the sequence of values to insert, in order — building a
 * BST is inherently a sequence of operations, not a single static
 * structure, so "the input" is naturally a list of values to insert
 * one at a time rather than a single number or pre-built tree.
 */
export type BstInsertInput = number[];

/**
 * Inserts `value` into `root`, yielding a `compare` step at every
 * node visited while walking down to find the insertion point, then
 * a `restructure` step once the new node is attached. Returns the
 * new root (same object if root didn't change, e.g. inserting into
 * a non-empty tree never changes which node is the root).
 *
 * Operates on a clone of the incoming tree and returns a new clone
 * reflecting the insertion — never mutates the tree snapshot that
 * was passed in, since that snapshot may still be referenced by an
 * earlier yielded step (the same "never mutate a snapshot already
 * yielded" discipline arrays' generators follow).
 */
function* insertOne(
  root: TreeNode | null,
  value: number,
): Generator<TreeAlgorithmStep, TreeNode | null> {
  const workingRoot = cloneTree(root);

  if (!workingRoot) {
    const newNode = createTreeNode(value);
    yield { type: 'restructure', root: newNode };
    return newNode;
  }

  let current: TreeNode = workingRoot;
  for (;;) {
    yield { type: 'compare', nodeId: current.id, root: workingRoot };

    if (value < current.value) {
      if (!current.left) {
        current.left = createTreeNode(value);
        break;
      }
      current = current.left;
    } else if (value > current.value) {
      if (!current.right) {
        current.right = createTreeNode(value);
        break;
      }
      current = current.right;
    } else {
      // Equal value: BSTs here don't store duplicates. Walking off
      // without inserting is a legitimate, visualizable outcome —
      // the comparisons up to this point are still meaningful.
      return workingRoot;
    }
  }

  yield { type: 'restructure', root: workingRoot };
  return workingRoot;
}

function* bstInsertGenerator(input: BstInsertInput): Generator<TreeAlgorithmStep> {
  resetTreeNodeIds();
  let root: TreeNode | null = null;

  for (const value of input) {
    root = yield* insertOne(root, value);
  }

  yield { type: 'done', outcome: 'mutation', root };
}

/**
 * Generates a sequence of distinct random values to insert.
 * Distinctness matters here specifically (unlike sorting, where
 * duplicates are a deliberately-tested case) because inserting a
 * duplicate is a no-op in this BST — a random sequence that happens
 * to repeat a value would silently produce a smaller tree than
 * `size` suggests, which would be a confusing demo experience even
 * though it's not a bug.
 */
function generateBstInsertInput(size: number): BstInsertInput {
  const values = new Set<number>();
  while (values.size < size) {
    values.add(Math.floor(Math.random() * 90) + 5);
  }
  return Array.from(values);
}

export const bstInsert: AlgorithmDefinition<BstInsertInput> = {
  id: 'bst-insert',
  name: 'BST Insert',
  category: 'trees',
  visualizationType: 'tree',
  difficulty: 'intermediate',
  description:
    'Builds a binary search tree by inserting values one at a time, walking left or right at each node until an empty spot is found.',
  complexity: {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  pseudocode: [
    'insert(root, value):',
    '  if root is null: return new node(value)',
    '  if value < root.value: root.left = insert(root.left, value)',
    '  else if value > root.value: root.right = insert(root.right, value)',
    '  return root',
  ],
  generateRandomInput: generateBstInsertInput,
  run: bstInsertGenerator,
};
