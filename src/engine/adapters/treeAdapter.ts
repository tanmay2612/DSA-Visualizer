import type { TreeAlgorithmStep, TreeNode } from '@/algorithms/shared/types';
import type {
  TreeNodeVisualState,
  TreeSceneDescription,
  TreeSceneNode,
} from '@/types/visualization.types';

const HORIZONTAL_SPACING = 50;
const VERTICAL_SPACING = 70;
const TOP_MARGIN = 40;

/**
 * Assigns x = in-order rank * spacing, y = depth * spacing. In-order
 * rank is the standard way to lay out a binary tree without
 * overlapping subtrees: visiting left-self-right and incrementing a
 * counter at each node guarantees every node's x position falls
 * strictly between its left subtree's and right subtree's
 * positions, which is exactly what makes the rendered tree look
 * correct (left children visually left, right children visually
 * right) without any collision-detection logic.
 *
 * Recomputed from scratch on every call rather than cached, since
 * the whole point (per TreeAlgorithmStep's doc comment in
 * shared/types.ts) is that tree STRUCTURE changes step to step —
 * there's no stable layout to reuse between two different
 * snapshots, unlike a graph's one-time circular layout.
 */
function layoutTree(root: TreeNode | null): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  let rank = 0;

  function visit(node: TreeNode | null, depth: number): void {
    if (!node) return;
    visit(node.left, depth + 1);
    positions.set(node.id, {
      x: rank * HORIZONTAL_SPACING,
      y: TOP_MARGIN + depth * VERTICAL_SPACING,
    });
    rank += 1;
    visit(node.right, depth + 1);
  }

  visit(root, 0);
  return positions;
}

function findParentId(root: TreeNode | null, childId: string): string | null {
  if (!root) return null;
  if (root.left?.id === childId || root.right?.id === childId) return root.id;
  return findParentId(root.left, childId) ?? findParentId(root.right, childId);
}

/**
 * Converts tree step history into a renderable scene. Takes ONLY
 * the step history (no separate structure parameter, unlike
 * graphAdapter) — every tree step already carries a full `root`
 * snapshot, the array-like pattern described in TreeAlgorithmStep's
 * doc comment, since tree structure genuinely changes step to step
 * rather than staying fixed the way a graph's does.
 *
 * `visited` accumulates across history (mark-visited never gets
 * un-marked — a completed traversal step is permanent, the same
 * accumulate-without-un-marking case as graphs' `mark-finalized`
 * and arrays' `eliminate-range`). `comparing`/`found` are transient,
 * shown only for the current step, the same transient-vs-
 * accumulated split used everywhere else in this codebase.
 */
export function treeAdapter(stepsUpToCurrent: TreeAlgorithmStep[]): TreeSceneDescription {
  if (stepsUpToCurrent.length === 0) {
    return { type: 'tree', nodes: [] };
  }

  const currentStep = stepsUpToCurrent[stepsUpToCurrent.length - 1];
  const root = currentStep.root;

  const visitedNodeIds = new Set<string>();
  for (const step of stepsUpToCurrent) {
    if (step.type === 'mark-visited') visitedNodeIds.add(step.nodeId);
  }

  const currentlyComparingNodeId = currentStep.type === 'compare' ? currentStep.nodeId : null;
  const currentlyFoundNodeId =
    currentStep.type === 'found' || (currentStep.type === 'done' && currentStep.outcome === 'found')
      ? currentStep.nodeId
      : null;

  const positions = layoutTree(root);
  const nodes: TreeSceneNode[] = [];

  function collect(node: TreeNode | null): void {
    if (!node) return;
    collect(node.left);

    const position = positions.get(node.id);
    let state: TreeNodeVisualState = 'default';
    if (visitedNodeIds.has(node.id)) state = 'visited';
    if (node.id === currentlyComparingNodeId) state = 'comparing';
    if (node.id === currentlyFoundNodeId) state = 'found';

    nodes.push({
      id: node.id,
      value: node.value,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      parentId: findParentId(root, node.id),
      state,
    });

    collect(node.right);
  }

  collect(root);

  return { type: 'tree', nodes };
}
