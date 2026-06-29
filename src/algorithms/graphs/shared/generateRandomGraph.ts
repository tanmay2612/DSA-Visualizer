import type { Graph, GraphEdge, GraphNode } from '../../shared/types';

const CANVAS_RADIUS = 160;
const CANVAS_CENTER = 200;

/**
 * Places `count` nodes evenly around a circle. A fixed, deterministic
 * layout rather than force-directed simulation — see the doc comment
 * on `Graph` in shared/types.ts for why: no runtime physics step
 * needed, and the same node count always lays out identically, which
 * makes the visualization (and testing it) much more predictable.
 */
function circularLayout(nodeIds: string[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = nodeIds.length;

  nodeIds.forEach((id, index) => {
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2; // start at top
    positions.set(id, {
      x: CANVAS_CENTER + CANVAS_RADIUS * Math.cos(angle),
      y: CANVAS_CENTER + CANVAS_RADIUS * Math.sin(angle),
    });
  });

  return positions;
}

/**
 * Generates a random CONNECTED graph: every node is reachable from
 * every other node. Achieved by first building a random spanning
 * tree (guarantees connectivity with exactly n-1 edges), then adding
 * a handful of extra random edges on top for visual interest and to
 * give pathfinding algorithms more than one route to consider.
 *
 * Connectivity-by-construction matters because BFS/DFS/Dijkstra
 * algorithms need a real graph to traverse — a naively random edge
 * set has a meaningful chance of leaving some nodes unreachable,
 * which would make "visit every reachable node" demonstrations
 * accidentally trivial or Dijkstra's "find a path" demonstrations
 * accidentally always fail.
 */
export function generateRandomGraph(nodeCount: number): Graph {
  const nodeIds = Array.from({ length: nodeCount }, (_, i) => `n${i}`);
  const positions = circularLayout(nodeIds);

  const nodes: GraphNode[] = nodeIds.map((id, index) => {
    const pos = positions.get(id);
    if (!pos) {
      // Defensive: circularLayout is built from this exact nodeIds
      // array, so every id is guaranteed a position. This branch
      // exists only so TypeScript doesn't see pos as possibly
      // undefined below, not because it can occur in practice.
      throw new Error(`Layout position missing for node ${id}`);
    }
    return { id, label: String.fromCharCode(65 + (index % 26)), x: pos.x, y: pos.y };
  });

  const edges: GraphEdge[] = [];
  const edgeKeySet = new Set<string>();

  function edgeKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function addEdge(from: string, to: string): void {
    const key = edgeKey(from, to);
    if (edgeKeySet.has(key)) return;
    edgeKeySet.add(key);
    edges.push({
      id: `e${edges.length}`,
      from,
      to,
      weight: Math.floor(Math.random() * 9) + 1,
    });
  }

  // Random spanning tree via randomized Prim-ish growth: start from
  // node 0, repeatedly connect a random not-yet-included node to a
  // random already-included node. Guarantees connectivity in
  // exactly nodeCount - 1 edges with no cycles yet.
  const included = [nodeIds[0]];
  const remaining = nodeIds.slice(1);
  while (remaining.length > 0) {
    const fromIndex = Math.floor(Math.random() * remaining.length);
    const from = remaining[fromIndex];
    const to = included[Math.floor(Math.random() * included.length)];
    addEdge(from, to);
    included.push(from);
    remaining.splice(fromIndex, 1);
  }

  // A few extra random edges on top, for visual richness and so
  // pathfinding has more than one route to choose between. Capped
  // relative to node count so small graphs don't get over-connected
  // into a visually cluttered mess.
  const extraEdgeCount = Math.max(0, Math.floor(nodeCount * 0.4));
  let attempts = 0;
  while (edges.length < nodeCount - 1 + extraEdgeCount && attempts < extraEdgeCount * 10) {
    attempts += 1;
    const a = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const b = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    if (a === b) continue;
    addEdge(a, b);
  }

  return { nodes, edges };
}
