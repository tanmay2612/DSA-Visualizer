import type { AlgorithmDefinition, Graph, GraphAlgorithmStep } from '../shared/types';
import { generateRandomGraph } from './shared/generateRandomGraph';
import type { GraphTraversalInput } from './bfs';

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
 * Recursive DFS. `mark-finalized` fires when recursion returns from
 * a node — i.e. every one of its neighbors has been explored as far
 * as they go — which is DFS's natural notion of "done with this
 * node," the same way BFS's dequeue moment is its natural "done."
 * Each algorithm gets to define what "finalized" means for itself;
 * the adapter doesn't need to know which one produced the step.
 */
function* dfsGenerator(input: GraphTraversalInput): Generator<GraphAlgorithmStep> {
  const { graph, startNodeId } = input;
  const adjacency = buildAdjacency(graph);
  const visited = new Set<string>();

  function* visit(nodeId: string): Generator<GraphAlgorithmStep> {
    visited.add(nodeId);
    yield { type: 'visit-node', nodeId };

    for (const { neighborId, edgeId } of adjacency.get(nodeId) ?? []) {
      if (visited.has(neighborId)) continue;
      yield { type: 'relax-edge', edgeId, nodeId: neighborId };
      yield* visit(neighborId);
    }

    yield { type: 'mark-finalized', nodeIds: [nodeId] };
  }

  yield* visit(startNodeId);
  yield { type: 'done', outcome: 'traversal' };
}

function generateDfsInput(size: number): GraphTraversalInput {
  const graph = generateRandomGraph(size);
  return { graph, startNodeId: graph.nodes[0].id };
}

export const dfs: AlgorithmDefinition<GraphTraversalInput> = {
  id: 'dfs',
  name: 'Depth-First Search',
  category: 'graphs',
  visualizationType: 'graph',
  difficulty: 'intermediate',
  description:
    'Explores a graph by following one path as far as it goes before backtracking, using recursion to dive deep before exploring siblings.',
  complexity: {
    time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    space: 'O(n)',
  },
  pseudocode: [
    'dfs(graph, node, visited):',
    '  visited.add(node)',
    '  for each neighbor of node:',
    '    if neighbor not in visited:',
    '      dfs(graph, neighbor, visited)',
  ],
  generateRandomInput: generateDfsInput,
  run: dfsGenerator,
};
