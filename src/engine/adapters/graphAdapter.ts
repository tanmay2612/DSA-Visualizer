import type { Graph, GraphAlgorithmStep } from '@/algorithms/shared/types';
import type {
  EdgeVisualState,
  GraphSceneDescription,
  NodeVisualState,
} from '@/types/visualization.types';

/**
 * Converts a graph algorithm's step history into a renderable
 * scene. Unlike arrayAdapter (which takes ONLY the step history,
 * since each array step carries its own full array snapshot — see
 * arrayAdapter's doc comment), this adapter takes the static
 * `Graph` as a separate parameter: graph STRUCTURE (which nodes,
 * which edges, their positions) never changes during a traversal —
 * only which nodes/edges are currently highlighted does. Embedding
 * the unchanging graph into every single step would be pure
 * duplication for no benefit, unlike arrays where the values
 * genuinely do change step to step.
 *
 * Distances accumulate from two sources: `relax-edge` steps that
 * carry `updatedDistance` (keyed by the step's explicit `nodeId`,
 * not inferred from the edge's two endpoints — see
 * GraphAlgorithmStep's doc comment for why that inference would be
 * ambiguous), and `mark-finalized`'s optional `distances` map, which
 * is the ONLY source for the start node's distance (0) — nothing
 * ever relaxes an edge INTO the search's own origin, so without
 * `mark-finalized` also carrying distance, the start node's
 * distance would never be communicated by any step at all. Caught
 * by testing the adapter's actual output against Dijkstra's real
 * path cost, not assumed correct from the type design alone. Once a
 * node's distance is known, it stays displayed even as later steps
 * relax other edges, the same accumulate-from-history pattern
 * arrayAdapter uses for "sorted" and "eliminated" state.
 *
 * `mark-finalized` accumulates permanently (a finalized node is
 * never revisited by BFS/DFS/Dijkstra, the same guarantee that
 * makes `eliminate-range` safe to accumulate without an un-marking
 * case — see arrayAdapter's doc comment on why merge sort needed
 * one and these don't).
 */
export function graphAdapter(
  graph: Graph,
  stepsUpToCurrent: GraphAlgorithmStep[],
): GraphSceneDescription {
  const finalizedNodeIds = new Set<string>();
  const distances = new Map<string, number>();
  let pathEdgeIds: string[] | null = null;

  for (const step of stepsUpToCurrent) {
    switch (step.type) {
      case 'visit-node':
        // Transient highlight only — handled below by checking
        // whether this is the CURRENT step, not accumulated here.
        break;
      case 'relax-edge':
        if (step.updatedDistance !== undefined) {
          distances.set(step.nodeId, step.updatedDistance);
        }
        break;
      case 'mark-finalized':
        step.nodeIds.forEach((id) => finalizedNodeIds.add(id));
        if (step.distances) {
          for (const [nodeId, distance] of Object.entries(step.distances)) {
            distances.set(nodeId, distance);
          }
        }
        break;
      case 'mark-path':
        pathEdgeIds = step.edgeIds;
        break;
      case 'done':
        // No additional accumulation needed: 'traversal' and
        // 'unreachable' both just mean "stop here, render whatever
        // accumulated so far"; 'path-found' already had its
        // mark-path step yielded immediately before done, which
        // already set pathEdgeIds above.
        break;
      default: {
        // Exhaustiveness check — see arrayAdapter for why this
        // matters: it's what would have caught `mark-active` being
        // forgotten there, and it does the same job here for any
        // future GraphAlgorithmStep variant.
        const exhaustiveCheck: never = step;
        void exhaustiveCheck;
      }
    }
  }

  // Only the CURRENT (most recent) step's visit/relax is shown as
  // the transient "active" highlight — once history moves past it,
  // it fades back to whatever its accumulated state is (finalized
  // or default). Same transient-vs-accumulated split arrayAdapter
  // uses for compare/swap vs. sorted/eliminated.
  const currentStep = stepsUpToCurrent[stepsUpToCurrent.length - 1];
  const currentlyVisitingNodeId = currentStep?.type === 'visit-node' ? currentStep.nodeId : null;
  const currentlyActiveEdgeId = currentStep?.type === 'relax-edge' ? currentStep.edgeId : null;

  const isOnPath = (edgeId: string): boolean => pathEdgeIds?.includes(edgeId) ?? false;

  return {
    type: 'graph',
    nodes: graph.nodes.map((node) => {
      let state: NodeVisualState = 'default';
      if (finalizedNodeIds.has(node.id)) state = 'finalized';
      if (node.id === currentlyVisitingNodeId) state = 'visiting';
      return {
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        state,
        distance: distances.get(node.id),
      };
    }),
    edges: graph.edges.map((edge) => {
      let state: EdgeVisualState = 'default';
      if (edge.id === currentlyActiveEdgeId) state = 'active';
      if (isOnPath(edge.id)) state = 'path';
      return { id: edge.id, from: edge.from, to: edge.to, weight: edge.weight, state };
    }),
  };
}
