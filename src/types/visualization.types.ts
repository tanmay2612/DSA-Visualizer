/**
 * What a canvas actually renders. Canvases never see an
 * AlgorithmStep directly — only a SceneDescription, produced by
 * an adapter. This is what lets ArrayCanvas stay identical whether
 * it's rendering bubble sort, merge sort, or binary search: it has
 * no idea which algorithm produced the scene, only what to draw.
 */

export type ElementVisualState = 'default' | 'compare' | 'swap' | 'sorted' | 'visited';

export interface ArraySceneElement {
  value: number;
  state: ElementVisualState;
}

export interface ArraySceneDescription {
  type: 'array';
  elements: ArraySceneElement[];
}

// Graph/tree scene shapes land in Phases 6/7.
export type SceneDescription = ArraySceneDescription;
