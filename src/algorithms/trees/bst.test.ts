import { describe, it, expect } from 'vitest';
import { bstInsert } from './bstInsert';
import { bstDelete } from './bstDelete';
import { inOrderTraversal } from './inOrderTraversal';
import type { TreeAlgorithmStep, TreeNode } from '@/algorithms/shared/types';

function collectValues(root: TreeNode | null): number[] {
  if (!root) return [];
  return [...collectValues(root.left), root.value, ...collectValues(root.right)];
}

function isValidBst(root: TreeNode | null, min = -Infinity, max = Infinity): boolean {
  if (!root) return true;
  if (root.value <= min || root.value >= max) return false;
  return isValidBst(root.left, min, root.value) && isValidBst(root.right, root.value, max);
}

function countNodes(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

// Type guard for tree done steps which carry `root`
function isMutationDone(
  step: TreeAlgorithmStep,
): step is { type: 'done'; outcome: 'mutation'; root: TreeNode | null } {
  return step.type === 'done' && step.outcome === 'mutation';
}

function runInsert(values: number[]) {
  const steps = [...bstInsert.run(values)] as TreeAlgorithmStep[];
  const last = steps[steps.length - 1];
  if (!isMutationDone(last)) throw new Error('Expected done/mutation');
  return { steps, root: last.root };
}

function runDelete(valuesToBuild: number[], valueToDelete: number) {
  const steps = [...bstDelete.run({ valuesToBuild, valueToDelete })] as TreeAlgorithmStep[];
  const last = steps[steps.length - 1];
  if (!isMutationDone(last)) throw new Error('Expected done/mutation');
  return { steps, root: last.root };
}

describe('bstInsert', () => {
  it('inserts values in correct BST order', () => {
    const { root } = runInsert([5, 2, 8, 1, 9, 3]);
    expect(isValidBst(root)).toBe(true);
    expect(collectValues(root)).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('handles empty input', () => {
    const { root } = runInsert([]);
    expect(root).toBeNull();
  });

  it('handles single value', () => {
    const { root } = runInsert([42]);
    expect(root?.value).toBe(42);
    expect(root?.left).toBeNull();
    expect(root?.right).toBeNull();
  });

  it('does not store duplicates', () => {
    const { root } = runInsert([5, 5, 5]);
    expect(countNodes(root)).toBe(1);
  });

  it('handles ascending input (degenerate right chain)', () => {
    const { root } = runInsert([1, 2, 3, 4, 5]);
    expect(isValidBst(root)).toBe(true);
    expect(collectValues(root)).toEqual([1, 2, 3, 4, 5]);
  });

  it('every intermediate snapshot is a valid BST', () => {
    const { steps } = runInsert([5, 2, 8, 1, 9]);
    const allValid = steps
      .filter((s): s is Extract<TreeAlgorithmStep, { root: TreeNode | null }> => 'root' in s)
      .every((s) => isValidBst(s.root));
    expect(allValid).toBe(true);
  });
});

describe('bstDelete', () => {
  const buildSeq = [5, 2, 8, 1, 3, 7, 9];

  it('deletes a leaf node', () => {
    const { root } = runDelete(buildSeq, 1);
    expect(collectValues(root).includes(1)).toBe(false);
    expect(isValidBst(root)).toBe(true);
    expect(countNodes(root)).toBe(6);
  });

  it('deletes a node with two children (root)', () => {
    const { root } = runDelete(buildSeq, 5);
    expect(collectValues(root).includes(5)).toBe(false);
    expect(isValidBst(root)).toBe(true);
    expect(countNodes(root)).toBe(6);
  });

  it('deletes an internal node with two children', () => {
    const { root } = runDelete(buildSeq, 2);
    expect(collectValues(root).includes(2)).toBe(false);
    expect(isValidBst(root)).toBe(true);
  });

  it('deletes the only node', () => {
    const { root } = runDelete([42], 42);
    expect(root).toBeNull();
  });

  it('handles non-existent value gracefully', () => {
    const { root } = runDelete(buildSeq, 100);
    expect(countNodes(root)).toBe(buildSeq.length);
    expect(isValidBst(root)).toBe(true);
  });

  it('every intermediate snapshot is a valid BST', () => {
    const { steps } = runDelete(buildSeq, 5);
    const allValid = steps
      .filter((s): s is Extract<TreeAlgorithmStep, { root: TreeNode | null }> => 'root' in s)
      .every((s) => isValidBst(s.root));
    expect(allValid).toBe(true);
  });
});

describe('inOrderTraversal', () => {
  it('visits nodes in sorted ascending order', () => {
    const input = [5, 2, 8, 1, 9, 3, 7, 4];
    const steps = [...inOrderTraversal.run(input)] as TreeAlgorithmStep[];
    const lastStep = steps[steps.length - 1];
    const finalRoot = 'root' in lastStep ? lastStep.root : null;

    function findNode(root: TreeNode | null, id: string): TreeNode | null {
      if (!root) return null;
      if (root.id === id) return root;
      return findNode(root.left, id) ?? findNode(root.right, id);
    }

    const visitOrder = steps
      .filter((s) => s.type === 'mark-visited')
      .map((s) => (s.type === 'mark-visited' ? findNode(finalRoot, s.nodeId)?.value : null))
      .filter((v): v is number => v !== null && v !== undefined);

    expect(visitOrder).toEqual([...new Set(input)].sort((a, b) => a - b));
  });

  it('handles empty input', () => {
    const steps = [...inOrderTraversal.run([])];
    expect(steps.filter((s) => s.type === 'mark-visited')).toHaveLength(0);
  });

  it('handles single element', () => {
    const steps = [...inOrderTraversal.run([42])];
    expect(steps.filter((s) => s.type === 'mark-visited')).toHaveLength(1);
  });
});
