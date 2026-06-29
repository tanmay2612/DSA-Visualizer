import type { AlgorithmDefinition, Graph, GraphAlgorithmStep } from '../shared/types';
import { generateRandomGraph } from './shared/generateRandomGraph';

/**
 * BFS input is `{ graph, startNodeId }`, not just `Graph` — the
 * same reasoning as searching's `{ values, target }` (shared/types.ts):
 * an algorithm needs more than the data structure itself to know
 * what to do with it. `startNodeId` is fixed to the graph's first
 * node by generateRandomInput, since which specific node is "first"
 * doesn't change what the traversal demonstrates.
 */
export interface GraphTraversalInput {
  graph: Graph;
  startNodeId: string;
}

/**
 * Builds an adjacency list once, since every graph algorithm here
 * needs to repeatedly ask "what's connected to this node" and the
 * raw edge list isn't efficient for that. Each algorithm builds its
 * own (rather than this living on the `Graph` type itself) since
 * adjacency representation is an algorithm-internal concern, not
 * part of the data the canvas/adapter need to know about.
 */
function buildAdjacency(graph: Graph): Map<string, { neighborId: string; edgeId: string }[]> {
  const adjacency = new Map<string, { neighborId: string; edgeId: string }[]>();
  graph.nodes.forEach((node) => adjacency.set(node.id, []));
  graph.edges.forEach((edge) => {
    adjacency.get(edge.from)?.push({ neighborId: edge.to, edgeId: edge.id });
    adjacency.get(edge.to)?.push({ neighborId: edge.from, edgeId: edge.id });
  });
  return adjacency;
}

/**
 * Standard BFS via an explicit queue. `mark-finalized` is yielded
 * the moment a node is dequeued (fully processed) rather than the
 * moment it's first discovered — matches the conventional "BFS
 * visits in dequeue order" mental model, and means a node enqueued
 * but not yet processed still shows as `visiting`, not `finalized`,
 * which is the visually honest distinction between "known about"
 * and "done with."
 */
function* bfsGenerator(input: GraphTraversalInput): Generator<GraphAlgorithmStep> {
  const { graph, startNodeId } = input;
  const adjacency = buildAdjacency(graph);
  const visited = new Set<string>([startNodeId]);
  const queue: string[] = [startNodeId];

  yield { type: 'visit-node', nodeId: startNodeId };

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;

    for (const { neighborId, edgeId } of adjacency.get(current) ?? []) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);
      yield { type: 'relax-edge', edgeId, nodeId: neighborId };
      yield { type: 'visit-node', nodeId: neighborId };
      queue.push(neighborId);
    }

    yield { type: 'mark-finalized', nodeIds: [current] };
  }

  yield { type: 'done', outcome: 'traversal' };
}

function generateBfsInput(size: number): GraphTraversalInput {
  const graph = generateRandomGraph(size);
  return { graph, startNodeId: graph.nodes[0].id };
}

export const bfs: AlgorithmDefinition<GraphTraversalInput> = {
  id: 'bfs',
  name: 'Breadth-First Search',
  category: 'graphs',
  visualizationType: 'graph',
  difficulty: 'intermediate',
  description:
    'Explores a graph level by level from a starting node, visiting every neighbor before moving further out — guarantees the shortest path by edge count in an unweighted graph.',
  complexity: {
    time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    space: 'O(n)',
  },
  pseudocode: [
    'bfs(graph, start):',
    '  queue = [start]',
    '  visited = {start}',
    '  while queue is not empty:',
    '    current = queue.dequeue()',
    '    for each neighbor of current:',
    '      if neighbor not in visited:',
    '        visited.add(neighbor)',
    '        queue.enqueue(neighbor)',
  ],
  generateRandomInput: generateBfsInput,
  run: bfsGenerator,
};
