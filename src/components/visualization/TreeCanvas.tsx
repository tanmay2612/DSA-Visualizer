import { motion } from 'framer-motion';
import type { TreeNodeVisualState, TreeSceneDescription } from '@/types/visualization.types';

interface TreeCanvasProps {
  scene: TreeSceneDescription;
}

const NODE_RADIUS = 16;
const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 320;

/**
 * Same CSS-variable-via-Framer-Motion approach as ArrayCanvas and
 * GraphCanvas — one consistent animation system across all three
 * canvases rather than mixing Motion-driven and CSS-driven color
 * transitions for the same kind of property.
 */
const NODE_COLOR_VAR: Record<TreeNodeVisualState, string> = {
  default: 'hsl(var(--card))',
  comparing: 'var(--color-viz-compare)',
  visited: 'var(--color-viz-sorted)',
  found: 'var(--color-viz-found)',
};

const NODE_STROKE_VAR: Record<TreeNodeVisualState, string> = {
  default: 'hsl(var(--border-strong))',
  comparing: 'var(--color-viz-compare)',
  visited: 'var(--color-viz-sorted)',
  found: 'var(--color-viz-found)',
};

/**
 * SVG-based, like GraphCanvas — trees need arbitrary 2D positions
 * and lines between parent/child pairs, the same reasoning that
 * made SVG the right fit for graphs. The key structural difference
 * from GraphCanvas: every node group here animates its position via
 * `animate={{x, y}}` on a `<motion.g>` wrapper, because unlike a
 * graph's fixed layout, a tree's node positions genuinely change
 * between snapshots as insert/delete restructure it (see
 * treeAdapter's doc comment on why layout is recomputed fresh every
 * call). Keying by `node.id` (stable across restructuring — see
 * treeHelpers.ts's id-assignment doc comment) is what lets React
 * recognize "this is the same node, now elsewhere" and lets Framer
 * Motion animate the transform smoothly instead of a new circle
 * appearing at the new position with no transition.
 *
 * Edge lines animate their endpoint coordinates directly
 * (`animate={{x1, y1, x2, y2}}`) rather than using `layout` — SVG
 * `<line>` elements don't have a meaningful "layout box" the way a
 * `<g>` does, so animating the coordinate attributes themselves is
 * the correct mechanism here, not Framer Motion's FLIP-based layout
 * system.
 */
export function TreeCanvas({ scene }: TreeCanvasProps) {
  const nodeById = new Map(scene.nodes.map((node) => [node.id, node]));
  const horizontalOffset = VIEWBOX_WIDTH / 2 - (scene.nodes.length * 25) / 2;

  return (
    <div
      className="flex h-80 w-full items-start justify-center overflow-auto rounded-lg border border-border bg-surface p-4"
      role="img"
      aria-label="Tree visualization"
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="h-full w-full max-w-2xl"
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${horizontalOffset}, 0)`}>
          {scene.nodes.map((node) => {
            const parent = node.parentId ? nodeById.get(node.parentId) : null;
            if (!parent) return null;
            return (
              <motion.line
                key={`edge-${node.id}`}
                initial={false}
                animate={{ x1: parent.x, y1: parent.y, x2: node.x, y2: node.y }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                stroke="hsl(var(--border-strong))"
                strokeWidth={1.5}
              />
            );
          })}

          {scene.nodes.map((node) => (
            <motion.g
              key={node.id}
              initial={false}
              animate={{ x: node.x, y: node.y }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              <motion.circle
                r={NODE_RADIUS}
                initial={false}
                animate={{
                  fill: NODE_COLOR_VAR[node.state],
                  stroke: NODE_STROKE_VAR[node.state],
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                strokeWidth={2}
              />
              <text textAnchor="middle" dy={4} className="fill-foreground text-xs font-semibold">
                {node.value}
              </text>
            </motion.g>
          ))}
        </g>
      </svg>
    </div>
  );
}
