import type { AlgorithmDefinition, Graph, GraphAlgorithmStep } from '../shared/types';
import { generateRandomGraph } from './shared/generateRandomGraph';

export interface ShortestPathInput {
  graph: Graph;
  startNodeId: string;
  targetNodeId: string;
}

/**
 * Minimal binary min-heap keyed by distance. Dijkstra's real-world
 * complexity claim (`O((V + E) log V)`, see ComplexityNotation in
 * algorithm.types.ts) is only true with a logarithmic-time
 * priority queue — a naive "scan for the minimum" implementation is
 * O(V^2) instead, which is a different, worse complexity class.
 * Implementing the heap properly here is what makes that complexity
 * badge an accurate claim rather than a generic textbook label
 * slapped on the wrong implementation.
 */
class MinHeap {
  private items: { nodeId: string; distance: number }[] = [];

  get size(): number {
    return this.items.length;
  }

  push(nodeId: string, distance: number): void {
    this.items.push({ nodeId, distance });
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent].distance <= this.items[i].distance) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  pop(): { nodeId: string; distance: number } | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left].distance < this.items[smallest].distance) {
          smallest = left;
        }
        if (
          right < this.items.length &&
          this.items[right].distance < this.items[smallest].distance
        ) {
          smallest = right;
        }
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}

function buildAdjacency(
  graph: Graph,
): Map<string, { neighborId: string; edgeId: string; weight: number }[]> {
  const adjacency = new Map<string, { neighborId: string; edgeId: string; weight: number }[]>();
  graph.nodes.forEach((node) => adjacency.set(node.id, []));
  graph.edges.forEach((edge) => {
    adjacency.get(edge.from)?.push({ neighborId: edge.to, edgeId: edge.id, weight: edge.weight });
    adjacency.get(edge.to)?.push({ neighborId: edge.from, edgeId: edge.id, weight: edge.weight });
  });
  return adjacency;
}

/**
 * Dijkstra's algorithm, finishing early once the target is popped
 * from the heap (finalized) rather than continuing to exhaust every
 * node — this is a real optimization, not just a visualization
 * shortcut: once the target's shortest distance is settled, nothing
 * later in the run can improve on it (the standard proof of
 * Dijkstra's correctness relies on exactly this).
 *
 * `relax-edge` carries `updatedDistance` only when relaxing the
 * edge actually improved a known distance — if the edge doesn't
 * improve anything, it's still highlighted (so the viewer can see
 * it was considered) but the step omits the field, and the adapter
 * shouldn't update any displayed distance for that case.
 */
function* dijkstraGenerator(input: ShortestPathInput): Generator<GraphAlgorithmStep> {
  const { graph, startNodeId, targetNodeId } = input;
  const adjacency = buildAdjacency(graph);

  const distances = new Map<string, number>(graph.nodes.map((node) => [node.id, Infinity]));
  const parentEdge = new Map<string, string>(); // nodeId -> edgeId used to reach it
  const finalized = new Set<string>();

  distances.set(startNodeId, 0);
  const heap = new MinHeap();
  heap.push(startNodeId, 0);

  while (heap.size > 0) {
    const popped = heap.pop();
    if (!popped) break;
    const { nodeId: current, distance: currentDistance } = popped;

    // A node can be pushed multiple times with different distances
    // (standard lazy-deletion approach); skip stale entries whose
    // distance no longer matches the best known one, and skip
    // anything already finalized.
    if (finalized.has(current) || currentDistance > (distances.get(current) ?? Infinity)) {
      continue;
    }

    yield { type: 'visit-node', nodeId: current };
    finalized.add(current);
    yield {
      type: 'mark-finalized',
      nodeIds: [current],
      distances: { [current]: currentDistance },
    };

    if (current === targetNodeId) {
      // Reconstruct the path by walking parent edges backward from
      // the target to the start.
      const pathEdgeIds: string[] = [];
      let walker = targetNodeId;
      while (walker !== startNodeId) {
        const edgeId = parentEdge.get(walker);
        if (!edgeId) break; // defensive; shouldn't happen if target was reached
        pathEdgeIds.unshift(edgeId);
        const edge = graph.edges.find((e) => e.id === edgeId);
        if (!edge) break;
        walker = edge.from === walker ? edge.to : edge.from;
      }
      yield { type: 'mark-path', edgeIds: pathEdgeIds };
      yield { type: 'done', outcome: 'path-found', pathEdgeIds };
      return;
    }

    for (const { neighborId, edgeId, weight } of adjacency.get(current) ?? []) {
      if (finalized.has(neighborId)) continue;

      const candidateDistance = currentDistance + weight;
      const knownDistance = distances.get(neighborId) ?? Infinity;

      if (candidateDistance < knownDistance) {
        distances.set(neighborId, candidateDistance);
        parentEdge.set(neighborId, edgeId);
        yield {
          type: 'relax-edge',
          edgeId,
          nodeId: neighborId,
          updatedDistance: candidateDistance,
        };
        heap.push(neighborId, candidateDistance);
      } else {
        yield { type: 'relax-edge', edgeId, nodeId: neighborId };
      }
    }
  }

  yield { type: 'done', outcome: 'unreachable' };
}

/**
 * Picks a start and target that are guaranteed different nodes.
 * Since generateRandomGraph always produces a connected graph (see
 * its doc comment), a path between any two distinct nodes always
 * exists — Dijkstra's "unreachable" outcome is a real code path the
 * algorithm must handle correctly, but it isn't reachable from this
 * specific input generator's output by construction. It IS reachable
 * if someone calls dijkstraGenerator directly with a disconnected
 * graph, which is exactly what the correctness tests exercise.
 */
function generateDijkstraInput(size: number): ShortestPathInput {
  const graph = generateRandomGraph(size);
  const startNodeId = graph.nodes[0].id;
  const targetNodeId = graph.nodes[graph.nodes.length - 1].id;
  return { graph, startNodeId, targetNodeId };
}

export const dijkstra: AlgorithmDefinition<ShortestPathInput> = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  category: 'graphs',
  visualizationType: 'graph',
  difficulty: 'advanced',
  description:
    'Finds the shortest path between two nodes in a weighted graph by always expanding the closest unfinalized node next, using a priority queue.',
  complexity: {
    time: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    space: 'O(n)',
  },
  pseudocode: [
    'dijkstra(graph, start, target):',
    '  distances[start] = 0, all others = infinity',
    '  priorityQueue = {start: 0}',
    '  while priorityQueue is not empty:',
    '    current = priorityQueue.popMinimum()',
    '    if current == target: return reconstructPath()',
    '    for each neighbor of current:',
    '      newDistance = distances[current] + weight(current, neighbor)',
    '      if newDistance < distances[neighbor]:',
    '        distances[neighbor] = newDistance',
    '        priorityQueue.push(neighbor, newDistance)',
  ],
  generateRandomInput: generateDijkstraInput,
  run: dijkstraGenerator,
};
