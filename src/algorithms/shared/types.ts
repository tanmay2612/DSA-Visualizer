/**
 * Pure algorithm-engine types. This file (and everything else in
 * `algorithms/`) must never import from React, Framer Motion, or
 * any `components/` path. Algorithms speak in plain data; the
 * engine and adapters translate that into something renderable.
 *
 * `AlgorithmStep` is a discriminated union. Each visualization type
 * (array/graph/tree) only ever produces a subset of these — the
 * `array` shape below is the only one implemented in Phase 2.
 * Graph and tree step shapes are added in Phases 6/7 without
 * touching this file's existing members or any array-algorithm code.
 */

import type {
  AlgorithmComplexity,
  AlgorithmDifficulty,
  VisualizationType,
} from '@/types/algorithm.types';

/**
 * A value tagged with a stable identity. The id is assigned once
 * when an array is generated and never changes, even as the value
 * moves to a different index during sorting. This is what lets the
 * canvas animate "this specific bar slides from position 2 to
 * position 5" instead of "the bar at position 2 instantly becomes
 * whatever value now lives there" — the latter is what you get if
 * you key by array index, and it makes swaps look like values
 * teleport/repaint in place rather than physically swap, which is
 * the one animation that actually matters for a sorting visualizer.
 */
export interface ArrayElement {
  id: number;
  value: number;
}

/**
 * Steps produced by array-based algorithms (sorting, searching).
 *
 * `mark-active` highlights a single "currently tracked" index —
 * selection sort's running minimum, quicksort's pivot — that isn't
 * part of a pairwise comparison/swap and isn't permanently sorted.
 * Unlike `mark-sorted` (which accumulates across the whole run,
 * see arrayAdapter), `mark-active` is transient: it describes only
 * the current step, the same way `compare`/`swap` do. An algorithm
 * that wants the highlight to persist across several steps (e.g.
 * "pivot stays highlighted through this whole partition pass")
 * re-yields `mark-active` with the same index on each of those
 * steps, rather than the adapter inferring persistence on its own.
 *
 * `compare-target` is `compare`'s searching counterpart: searching
 * checks one array index against an external target value, not
 * against another array index, so it can't reuse `compare`'s
 * `indices: [number, number]` shape. `targetValue` is carried on
 * every step (not just looked up once) so the adapter never needs
 * to know which algorithm is running to render it — it's just data.
 *
 * `eliminate-range` accumulates like `mark-sorted` (an eliminated
 * range is never reconsidered, so — unlike merge sort's sorted
 * regions — there's no un-marking case to handle here).
 *
 * `found` marks the single index where a search target was located.
 * Deliberately distinct from `mark-sorted`/`done`'s "sorted" — see
 * ElementVisualState's doc comment for why conflating them would be
 * semantically dishonest even where the colors might look similar.
 *
 * `done.outcome` makes explicit what kind of algorithm just
 * finished, rather than inferring it from whether `foundIndex` is
 * present — that was the original design here, and it was wrong:
 * a sort's done and a search's "not found" done were both
 * `{ type: 'done', array }` with no foundIndex, so the adapter
 * couldn't tell them apart and incorrectly marked a not-found
 * search's array fully "sorted" (overwriting its accumulated
 * eliminated-range state). Caught via a standalone test that
 * specifically checked elimination coverage on not-found cases —
 * the found-case tests alone didn't exercise this path. `outcome`
 * is now an explicit tag: 'sort' (mark everything sorted),
 * 'found' (mark only `foundIndex` found, preserve everything else
 * as already accumulated), or 'not-found' (preserve everything
 * already accumulated, mark nothing new).
 */
export type ArrayAlgorithmStep =
  | { type: 'compare'; indices: [number, number]; array: ArrayElement[] }
  | { type: 'compare-target'; index: number; targetValue: number; array: ArrayElement[] }
  | { type: 'swap'; indices: [number, number]; array: ArrayElement[] }
  | { type: 'overwrite'; index: number; array: ArrayElement[] }
  | { type: 'mark-active'; index: number; array: ArrayElement[] }
  | { type: 'mark-sorted'; indices: number[]; array: ArrayElement[] }
  | { type: 'eliminate-range'; indices: number[]; array: ArrayElement[] }
  | { type: 'found'; index: number; array: ArrayElement[] }
  | (
      | { type: 'done'; array: ArrayElement[]; outcome: 'sort' }
      | { type: 'done'; array: ArrayElement[]; outcome: 'found'; foundIndex: number }
      | { type: 'done'; array: ArrayElement[]; outcome: 'not-found' }
    );

// Graph/tree step unions land in Phases 6/7. AlgorithmStep is kept
// as an alias (not a hardcoded equal to ArrayAlgorithmStep) so that
// adding `| GraphAlgorithmStep` later is a one-line change here,
// not a refactor of every file that imports AlgorithmStep.
export type AlgorithmStep = ArrayAlgorithmStep | GraphAlgorithmStep | TreeAlgorithmStep;

/**
 * Graph data model (Phase 6). Deliberately simple: every algorithm
 * (BFS, DFS, Dijkstra) works over the same `Graph` shape rather than
 * each defining its own adjacency representation, the same way
 * every sorting algorithm operates on the same `ArrayElement[]`.
 *
 * `x`/`y` are precomputed once at generation time (a circular
 * layout — see graphs/shared/layout.ts) and never recomputed during
 * traversal. The architecture doc explicitly calls out fixed layout
 * over force-directed simulation as the right trade-off here: force
 * layout needs a runtime physics step per frame, which is real
 * complexity this app's portfolio scope doesn't need, and a fixed
 * layout is fully deterministic — the same graph always renders
 * identically, which matters for reasoning about and testing the
 * visualization.
 *
 * Edges are undirected and weighted (`weight` defaults to 1 for
 * BFS/DFS, where edge weight is meaningless — Dijkstra is the only
 * algorithm that reads it). One edge shape serves both rather than
 * having weighted/unweighted be separate graph types, since that
 * would force every consumer (canvas, adapter) to handle two graph
 * shapes for no real benefit.
 */
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Steps produced by graph algorithms (BFS, DFS, Dijkstra). Mirrors
 * the array step vocabulary's design patterns rather than
 * reinventing new conventions:
 *
 * `visit-node` is transient (current-step-only highlight) — the
 * same role `mark-active` plays for arrays: "this is what's being
 * looked at right now," not a permanent state.
 *
 * `relax-edge` highlights one edge currently being examined, and
 * names which node (`nodeId`, one of the edge's two endpoints) the
 * relaxation is evaluating a distance update FOR — explicit rather
 * than left for the adapter to infer from the edge's two endpoints,
 * which is genuinely ambiguous (an edge has two ends; only the
 * algorithm actually knows which one it's currently relaxing
 * toward). Dijkstra "relaxes" an edge by checking whether going
 * through it improves a known distance; BFS/DFS use the same step
 * to mean "traversing this edge toward this node" even though they
 * don't compare distances — one shape, since the visual (highlight
 * this edge, highlight this node) is identical either way, and the
 * adapter doesn't need to know which algorithm produced it.
 *
 * `mark-finalized` accumulates like `mark-sorted` — once a node's
 * shortest distance (Dijkstra) or visited status (BFS/DFS) is
 * settled, it stays visually settled, the same accumulate-from-
 * history approach graphAdapter will use for the same reasons
 * arrayAdapter does. Optionally carries `distances` (node id ->
 * final distance) for algorithms that track distance at all —
 * Dijkstra sets this every time it finalizes a node, INCLUDING the
 * start node (distance 0), which is the only way the adapter learns
 * the start node's distance at all: the start node is never the
 * target of a `relax-edge` (nothing relaxes INTO the search's own
 * origin), so without this, the start node's distance would never
 * be communicated through any step and would display as unknown
 * forever — a real gap caught by testing the adapter's output
 * against Dijkstra's actual final path cost, not assumed away.
 * BFS/DFS omit `distances` entirely, since hop count isn't what
 * either algorithm is demonstrating.
 *
 * `mark-path` highlights the final traversal/shortest-path edges
 * once the algorithm concludes — this is graphs' equivalent of
 * arrays' `found`: the payoff visual that justifies having watched
 * the whole run. Carries the ordered list of edge ids on the path
 * (not node ids) so the adapter doesn't need to re-derive which
 * edges connect consecutive path nodes.
 *
 * `done.outcome` mirrors arrays' done design (see ArrayAlgorithmStep's
 * doc comment for why this needed to be an explicit tag, not
 * inferred): 'traversal' for BFS/DFS, which always visits everything
 * reachable and has no "not found" concept; 'path-found' /
 * 'unreachable' for Dijkstra, which is specifically pathfinding
 * between a source and target and can legitimately fail to find one
 * if the graph is disconnected.
 */
export type GraphAlgorithmStep =
  | { type: 'visit-node'; nodeId: string }
  | { type: 'relax-edge'; edgeId: string; nodeId: string; updatedDistance?: number }
  | { type: 'mark-finalized'; nodeIds: string[]; distances?: Record<string, number> }
  | { type: 'mark-path'; edgeIds: string[] }
  | (
      | { type: 'done'; outcome: 'traversal' }
      | { type: 'done'; outcome: 'path-found'; pathEdgeIds: string[] }
      | { type: 'done'; outcome: 'unreachable' }
    );

/**
 * Tree data model (Phase 7). Unlike `Graph` (Phase 6) — whose
 * STRUCTURE never changes during a traversal, only visual state
 * does, so graph steps reference a separately-passed static graph
 * by id — a BST's structure genuinely changes with every insert,
 * delete, and rotation. That makes trees structurally closer to
 * ARRAYS than to graphs: the data itself mutates step to step, not
 * just its highlighting. So tree steps follow the array pattern
 * instead of the graph one: every step carries a full tree
 * snapshot (`root: TreeNode | null`), the same way every array step
 * carries a full `array: ArrayElement[]` snapshot — not a reference
 * to a separately-tracked mutable structure.
 *
 * `x`/`y` are NOT precomputed once like a graph's circular layout —
 * they're recomputed by the adapter on every snapshot (in-order
 * position for x, depth for y), since the shape itself changes.
 * Algorithms therefore don't set x/y at all; only `id` and `value`
 * matter to the algorithm, and the adapter (not the algorithm)
 * owns layout — the same "algorithm produces semantics, adapter
 * produces visuals" split used everywhere else.
 */
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * Steps produced by tree algorithms (BST insert, delete, traversal).
 *
 * `compare` is tree-shaped, not array-shaped: comparing the
 * algorithm's current target value against ONE node (not two
 * indices, since a BST search/insert walk only ever looks at one
 * node — itself — and decides to go left or right, there's no
 * second node being compared against). Reuses the name `compare`
 * from arrays for the same semantic role (a transient "currently
 * examining" highlight) even though the shape differs, rather than
 * inventing an unrelated name for the same idea.
 *
 * `mark-visited` accumulates like arrays' `mark-sorted` and graphs'
 * `mark-finalized` — once a traversal has visited a node, it stays
 * visually visited through the rest of the run.
 *
 * `restructure` is the one structural step: every insert, delete,
 * or (future) rotation produces a new `root` snapshot. Named
 * generically rather than `insert`/`delete`/`rotate` specifically
 * because the adapter doesn't need to know which operation
 * produced the new shape, only that the shape changed — the same
 * reason arrays' `swap` and `overwrite` are both just "the array
 * changed," not algorithm-specific names.
 *
 * `done.outcome` mirrors the array/graph pattern: 'mutation' for
 * insert/delete (the tree's final shape IS the result, nothing to
 * report beyond it), 'traversal' for in-order/pre-order/post-order
 * (visits everything, no notion of success/failure), 'found' /
 * 'not-found' for a BST search.
 */
export type TreeAlgorithmStep =
  | { type: 'compare'; nodeId: string; root: TreeNode | null }
  | { type: 'restructure'; root: TreeNode | null }
  | { type: 'mark-visited'; nodeId: string; root: TreeNode | null }
  | { type: 'found'; nodeId: string; root: TreeNode | null }
  | (
      | { type: 'done'; outcome: 'mutation'; root: TreeNode | null }
      | { type: 'done'; outcome: 'traversal'; root: TreeNode | null }
      | { type: 'done'; outcome: 'found'; nodeId: string; root: TreeNode | null }
      | { type: 'done'; outcome: 'not-found'; root: TreeNode | null }
    );

export type StepType = AlgorithmStep['type'];

/**
 * Full algorithm definition — the contract every algorithm
 * implementation satisfies. Note `run` is the *only* logic method;
 * play/pause/step/reset are deliberately NOT part of this interface
 * (see AlgorithmEngine) because that playback behavior is identical
 * across every algorithm and shouldn't be reimplemented per file.
 */
export interface AlgorithmDefinition<TInput = number[]> {
  id: string;
  name: string;
  category: string;
  visualizationType: VisualizationType;
  difficulty: AlgorithmDifficulty;
  /** One sentence, shown on AlgorithmCard and the detail page header. */
  description: string;
  complexity: AlgorithmComplexity;
  /** Pseudocode lines, rendered by PseudocodeViewer in a later phase. */
  pseudocode: string[];
  /** Produces a random input of the requested size for this algorithm. */
  generateRandomInput: (size: number) => TInput;
  /** The algorithm itself. Pure generator — no side effects beyond yielding steps. */
  run: (input: TInput) => Generator<AlgorithmStep, void, unknown>;
}
