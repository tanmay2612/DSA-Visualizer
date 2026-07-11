import type { AlgorithmDefinition } from '../shared/types';

/**
 * Interview Problem Mode (Phase 10, Feature 2). Deliberately a thin
 * *extension* of AlgorithmDefinition — not a parallel type, and not
 * a second execution engine. Every field AlgorithmDefinition already
 * has (pseudocode, complexity, generateRandomInput, run) means
 * exactly the same thing here and is consumed by the exact same
 * AlgorithmEngine/adapters/canvas pipeline that sorting and
 * searching already use. Only three fields are new, and they're
 * purely descriptive (rendered as static text on the problem's
 * detail page, never touched by the engine): `topics` for the badge
 * row, `problemStatement` for the short original-wording description
 * the phase brief asks for, and `example` for the one worked example
 * shown above the visualization.
 */
export interface InterviewExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface InterviewProblemDefinition<TInput = number[]>
  extends AlgorithmDefinition<TInput> {
  topics: string[];
  problemStatement: string;
  example: InterviewExample;
}
