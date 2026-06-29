/**
 * What a canvas actually renders. Canvases never see an
 * AlgorithmStep directly — only a SceneDescription, produced by
 * an adapter. This is what lets ArrayCanvas stay identical whether
 * it's rendering bubble sort, merge sort, or binary search: it has
 * no idea which algorithm produced the scene, only what to draw.
 */

/**
 * `eliminated` and `found` are searching-specific (added in Phase
 * 5): binary search's core visual is the search space shrinking —
 * eliminated halves fade out rather than taking on a new highlight
 * color, since "removed from consideration" is a different kind of
 * signal than "currently active." `found` is deliberately distinct
 * from `sorted` even though both are positive terminal states — a
 * search doesn't sort anything, and conflating the two would be
 * semantically dishonest even if the colors happened to look similar.
 */
export type ElementVisualState =
  | 'default'
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'visited'
  | 'eliminated'
  | 'found';

export interface ArraySceneElement {
  id: number;
  value: number;
  state: ElementVisualState;
}

export interface ArraySceneDescription {
  type: 'array';
  elements: ArraySceneElement[];
}

/**
 * Node/edge visual states for graph algorithms. Named to mirror
 * `ElementVisualState`'s role-based naming where the concepts line
 * up (`visited`/`finalized` ~ arrays' `visited`/`sorted`: transient
 * "currently being looked at" vs. permanently settled), and to
 * introduce graph-specific concepts plainly where they don't
 * (`path`, for the final highlighted route) rather than forcing a
 * strained array-state name onto something that isn't really the
 * same idea.
 */
export type NodeVisualState = 'default' | 'visiting' | 'finalized' | 'path';
export type EdgeVisualState = 'default' | 'active' | 'path';

export interface GraphSceneNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: NodeVisualState;
  /** Dijkstra's running shortest-known distance, shown as a label
   *  on the node once known. `undefined` until the algorithm has
   *  discovered any distance to this node at all. */
  distance?: number;
}

export interface GraphSceneEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  state: EdgeVisualState;
}

export interface GraphSceneDescription {
  type: 'graph';
  nodes: GraphSceneNode[];
  edges: GraphSceneEdge[];
}

export type SceneDescription = ArraySceneDescription | GraphSceneDescription;
