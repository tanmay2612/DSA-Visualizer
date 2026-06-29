import type { TreeNode } from '../../shared/types';

let nextId = 0;

/**
 * Monotonically increasing ids, reset per algorithm run via
 * `resetTreeNodeIds`. Mirrors arrayElements.ts's id-per-element
 * approach: every node gets a stable identity the moment it's
 * created, which never changes even as later inserts/deletes
 * restructure the tree around it — needed for the canvas to
 * animate "this node moved" rather than "this position's value
 * changed," the same reasoning that drove arrays' id design in
 * Phase 3.
 */
export function resetTreeNodeIds(): void {
  nextId = 0;
}

export function createTreeNode(value: number): TreeNode {
  const node: TreeNode = { id: `t${nextId}`, value, left: null, right: null };
  nextId += 1;
  return node;
}

/**
 * Deep-clones a tree. Every structural step yields a fresh snapshot
 * (the same "full snapshot, not a diff" approach arrays use — see
 * bubbleSort's doc comment on why this is what makes reverse
 * playback trivial), so mutating one snapshot must never be visible
 * in an earlier one. Clone preserves each node's id, since id
 * identity — not object identity — is what the canvas keys on.
 */
export function cloneTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  return {
    id: root.id,
    value: root.value,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
  };
}

/**
 * Finds the node with the given id within a tree snapshot. Used by
 * generators that need to locate "the node we just created" inside
 * a freshly-cloned tree (clone produces new node objects with the
 * same ids, so object identity can't be used to find them again —
 * only id can).
 */
export function findNodeById(root: TreeNode | null, id: string): TreeNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  return findNodeById(root.left, id) ?? findNodeById(root.right, id);
}
