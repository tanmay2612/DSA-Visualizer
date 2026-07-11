import { Info, Variable } from 'lucide-react';
import type { AlgorithmStep } from '@/algorithms/shared/types';

interface StepInfoPanelProps {
  step: AlgorithmStep | null;
  algorithmName: string;
}

interface StepVariable {
  name: string;
  value: string;
}

interface StepInfo {
  explanation: string;
  variables: StepVariable[];
}

/**
 * Extracts human-readable explanation text and current variable
 * values from a step, purely by reading the data already present
 * in each step's fields — no algorithm-side changes needed.
 *
 * Array steps carry `indices`, `index`, `targetValue`, etc.
 * Graph steps carry `nodeId`, `edgeId`, `updatedDistance`.
 * Tree steps carry `nodeId`, `root`.
 * All of this was already there — this component just surfaces it.
 */
function extractStepInfo(step: AlgorithmStep | null, algorithmName: string): StepInfo {
  if (!step) {
    return {
      explanation: `Load ${algorithmName} and press Play to begin stepping through the algorithm.`,
      variables: [],
    };
  }

  switch (step.type) {
    // ── Array steps ─────────────────────────────────────────────
    case 'compare': {
      if ('indices' in step) {
        const [i, j] = step.indices;
        const a = step.array[i]?.value ?? '?';
        const b = step.array[j]?.value ?? '?';
        const needsSwap = a > b;
        return {
          explanation: `Comparing ${a} at [${i}] with ${b} at [${j}]. ${needsSwap ? `${a} > ${b}, a swap is needed.` : `${a} ≤ ${b}, already in order.`}`,
          variables: [
            { name: 'i', value: String(i) },
            { name: 'j', value: String(j) },
            { name: 'array[i]', value: String(a) },
            { name: 'array[j]', value: String(b) },
          ],
        };
      }
      if ('nodeId' in step) {
        return {
          explanation: `Examining node ${step.nodeId} — deciding to go left or right.`,
          variables: [{ name: 'nodeId', value: step.nodeId }],
        };
      }
      return { explanation: 'Comparing elements.', variables: [] };
    }

    case 'compare-target': {
      const val = step.array[step.index]?.value ?? '?';
      const rel =
        val === step.targetValue
          ? 'equal to'
          : (val as number) < step.targetValue
            ? 'less than'
            : 'greater than';
      return {
        explanation: `Checking index ${step.index}: value ${val} is ${rel} target ${step.targetValue}.`,
        variables: [
          { name: 'index', value: String(step.index) },
          { name: 'array[index]', value: String(val) },
          { name: 'target', value: String(step.targetValue) },
        ],
      };
    }

    case 'swap': {
      const [i, j] = step.indices;
      const a = step.array[i]?.value ?? '?';
      const b = step.array[j]?.value ?? '?';
      return {
        explanation: `Swapping ${a} (at [${i}]) with ${b} (at [${j}]).`,
        variables: [
          { name: 'i', value: String(i) },
          { name: 'j', value: String(j) },
          { name: 'array[i]', value: String(a) },
          { name: 'array[j]', value: String(b) },
        ],
      };
    }

    case 'overwrite': {
      const val = step.array[step.index]?.value ?? '?';
      return {
        explanation: `Writing ${val} to position ${step.index} (merge sort placing value into sorted position).`,
        variables: [
          { name: 'index', value: String(step.index) },
          { name: 'value', value: String(val) },
        ],
      };
    }

    case 'mark-active': {
      const val = step.array[step.index]?.value ?? '?';
      return {
        explanation: `Current tracked index: ${step.index} (value ${val}). This is the running minimum or active pointer.`,
        variables: [
          { name: 'activeIndex', value: String(step.index) },
          { name: 'activeValue', value: String(val) },
        ],
      };
    }

    case 'mark-sorted': {
      return {
        explanation: `Position${step.indices.length > 1 ? 's' : ''} [${step.indices.join(', ')}] confirmed in final sorted position.`,
        variables: [{ name: 'sorted', value: `[${step.indices.join(', ')}]` }],
      };
    }

    case 'eliminate-range': {
      const lo = step.indices[0];
      const hi = step.indices[step.indices.length - 1];
      return {
        explanation: `Eliminating positions ${lo}–${hi}: target cannot be in this half. Search space halved.`,
        variables: [
          { name: 'lo', value: String(lo) },
          { name: 'hi', value: String(hi) },
          { name: 'eliminated', value: String(step.indices.length) },
        ],
      };
    }

    case 'found': {
      if ('index' in step) {
        const val = step.array[step.index]?.value ?? '?';
        return {
          explanation: `Target found at index ${step.index} (value ${val}).`,
          variables: [
            { name: 'foundIndex', value: String(step.index) },
            { name: 'value', value: String(val) },
          ],
        };
      }
      if ('nodeId' in step) {
        return {
          explanation: `Found node ${step.nodeId} in the tree.`,
          variables: [{ name: 'nodeId', value: step.nodeId }],
        };
      }
      return { explanation: 'Target found.', variables: [] };
    }

    case 'mark-result': {
      const labels = step.indices.map((i) => step.array[i]?.label ?? step.array[i]?.value ?? '?');
      return {
        explanation: `Answer highlight: position${step.indices.length === 1 ? '' : 's'} [${step.indices.join(', ')}] (${labels.join(', ')}).`,
        variables: [{ name: 'resultIndices', value: `[${step.indices.join(', ')}]` }],
      };
    }

    case 'done': {
      if ('outcome' in step) {
        const o = step.outcome;
        if (o === 'sort')
          return { explanation: 'Array fully sorted. Algorithm complete.', variables: [] };
        if (o === 'found')
          return {
            explanation: 'Target found. Algorithm complete.',
            variables:
              'foundIndex' in step ? [{ name: 'foundIndex', value: String(step.foundIndex) }] : [],
          };
        if (o === 'not-found')
          return { explanation: 'Target not in array. Algorithm complete.', variables: [] };
        if (o === 'result')
          return {
            explanation: `${step.resultLabel} Algorithm complete.`,
            variables: [{ name: 'resultIndices', value: `[${step.indices.join(', ')}]` }],
          };
        if (o === 'traversal')
          return { explanation: 'All reachable nodes visited. Traversal complete.', variables: [] };
        if (o === 'path-found')
          return {
            explanation: `Shortest path found (${step.pathEdgeIds.length} edge${step.pathEdgeIds.length === 1 ? '' : 's'}).`,
            variables: [{ name: 'pathEdges', value: String(step.pathEdgeIds.length) }],
          };
        if (o === 'unreachable')
          return { explanation: 'Target node is unreachable from the start node.', variables: [] };
        if (o === 'mutation') return { explanation: 'Tree operation complete.', variables: [] };
      }
      return { explanation: 'Algorithm complete.', variables: [] };
    }

    // ── Graph steps ──────────────────────────────────────────────
    case 'visit-node':
      return {
        explanation: `Visiting node ${step.nodeId}. Queuing its unvisited neighbours.`,
        variables: [{ name: 'current', value: step.nodeId }],
      };

    case 'relax-edge': {
      const improved = step.updatedDistance !== undefined;
      return {
        explanation: improved
          ? `Edge ${step.edgeId} relaxed — node ${step.nodeId} now has a shorter known distance: ${step.updatedDistance}.`
          : `Examined edge ${step.edgeId} toward ${step.nodeId}: existing distance is already optimal.`,
        variables: [
          { name: 'edge', value: step.edgeId },
          { name: 'to', value: step.nodeId },
          ...(step.updatedDistance !== undefined
            ? [{ name: 'dist', value: String(step.updatedDistance) }]
            : []),
        ],
      };
    }

    case 'mark-finalized':
      return {
        explanation: `Node${step.nodeIds.length > 1 ? 's' : ''} ${step.nodeIds.join(', ')} finalised — shortest distance confirmed.`,
        variables: step.nodeIds.map((id) => ({
          name: id,
          value: step.distances?.[id] !== undefined ? String(step.distances[id]) : '✓',
        })),
      };

    case 'mark-path':
      return {
        explanation: `Tracing shortest path: ${step.edgeIds.length} edge${step.edgeIds.length === 1 ? '' : 's'}.`,
        variables: [{ name: 'pathLen', value: String(step.edgeIds.length) }],
      };

    // ── Tree steps ───────────────────────────────────────────────
    case 'restructure':
      return {
        explanation: 'Tree structure updated — a node was inserted or removed.',
        variables: [],
      };

    case 'mark-visited':
      return {
        explanation: `Visited node ${step.nodeId} during in-order traversal.`,
        variables: [{ name: 'visited', value: step.nodeId }],
      };

    default: {
      const exhaustive: never = step;
      void exhaustive;
      return { explanation: 'Processing…', variables: [] };
    }
  }
}

/**
 * Shows what the algorithm is currently doing (plain-English
 * explanation) and the key variable values at this step. Both are
 * derived entirely from the step data already carried in each step
 * type's fields — this component doesn't need algorithm-specific
 * knowledge, just a step and the algorithm's name for context.
 */
export function StepInfoPanel({ step, algorithmName }: StepInfoPanelProps) {
  const { explanation, variables } = extractStepInfo(step, algorithmName);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-2.5">
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-foreground">{explanation}</p>
      </div>

      {variables.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            <Variable className="size-3" />
            Variables
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {variables.map(({ name, value }) => (
              <div
                key={name}
                className="flex items-center gap-1.5 rounded-md bg-surface px-2 py-1.5"
              >
                <span className="font-mono text-[10px] text-accent">{name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">=</span>
                <span className="truncate font-mono text-[10px] font-medium text-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
