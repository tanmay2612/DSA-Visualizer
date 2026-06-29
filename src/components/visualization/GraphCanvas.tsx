import { motion } from 'framer-motion';
import type {
  EdgeVisualState,
  GraphSceneDescription,
  NodeVisualState,
} from '@/types/visualization.types';

interface GraphCanvasProps {
  scene: GraphSceneDescription;
}

const VIEWBOX_SIZE = 400;
const NODE_RADIUS = 18;

/**
 * Same approach as ArrayCanvas's STATE_COLOR_VAR: CSS variable
 * references animated via Framer Motion's `animate` prop, not
 * Tailwind classes, so color transitions go through one consistent
 * animation system rather than mixing Motion-driven and CSS-driven
 * transitions for the same visual property.
 */
const NODE_COLOR_VAR: Record<NodeVisualState, string> = {
  default: 'hsl(var(--card))',
  visiting: 'var(--color-viz-compare)',
  finalized: 'var(--color-viz-sorted)',
  path: 'var(--color-viz-found)',
};

const NODE_STROKE_VAR: Record<NodeVisualState, string> = {
  default: 'hsl(var(--border-strong))',
  visiting: 'var(--color-viz-compare)',
  finalized: 'var(--color-viz-sorted)',
  path: 'var(--color-viz-found)',
};

const EDGE_COLOR_VAR: Record<EdgeVisualState, string> = {
  default: 'hsl(var(--border-strong))',
  active: 'var(--color-viz-compare)',
  path: 'var(--color-viz-found)',
};

const EDGE_WIDTH: Record<EdgeVisualState, number> = {
  default: 1.5,
  active: 3,
  path: 3,
};

/**
 * SVG-based, unlike ArrayCanvas's div-based bars — graphs need
 * arbitrary 2D positions and lines between two arbitrary points,
 * which SVG expresses far more directly than absolutely-positioned
 * divs would. Node/edge positions come entirely from the scene
 * (precomputed once at graph-generation time, see
 * generateRandomGraph's circular layout) — this component never
 * computes a layout itself, only renders the one it's given.
 *
 * Edges render before nodes in document order so nodes visually sit
 * on top of the lines connecting them, not the other way around.
 */
export function GraphCanvas({ scene }: GraphCanvasProps) {
  const nodeById = new Map(scene.nodes.map((node) => [node.id, node]));

  return (
    <div
      className="flex h-96 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
      role="img"
      aria-label="Graph visualization"
    >
      <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="h-full w-full max-w-md">
        {scene.edges.map((edge) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to) return null;

          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={edge.id}>
              <motion.line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                initial={false}
                animate={{
                  stroke: EDGE_COLOR_VAR[edge.state],
                  strokeWidth: EDGE_WIDTH[edge.state],
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
              <text
                x={midX}
                y={midY}
                dy={-4}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {scene.nodes.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={NODE_RADIUS}
              initial={false}
              animate={{
                fill: NODE_COLOR_VAR[node.state],
                stroke: NODE_STROKE_VAR[node.state],
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              strokeWidth={2}
            />
            <text
              x={node.x}
              y={node.y}
              dy={4}
              textAnchor="middle"
              className="fill-foreground text-xs font-semibold"
            >
              {node.label}
            </text>
            {node.distance !== undefined && (
              <text
                x={node.x}
                y={node.y + NODE_RADIUS + 12}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {node.distance}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
