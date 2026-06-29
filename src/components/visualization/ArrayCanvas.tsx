import { motion } from 'framer-motion';
import type { ArraySceneDescription, ElementVisualState } from '@/types/visualization.types';

interface ArrayCanvasProps {
  scene: ArraySceneDescription;
}

/**
 * CSS variable references, not Tailwind classes — these are
 * animated via Framer Motion's `animate` prop (which interpolates
 * actual color values), the same approach HeroVisualization uses.
 * A Tailwind className swap would only get a CSS `transition`, not
 * a Motion-driven one, and mixing both systems for the same
 * property is what causes janky double-animations.
 */
const STATE_COLOR_VAR: Record<ElementVisualState, string> = {
  default: 'hsl(var(--border-strong))',
  compare: 'var(--color-viz-compare)',
  swap: 'var(--color-viz-swap)',
  sorted: 'var(--color-viz-sorted)',
  visited: 'var(--color-viz-visited)',
  eliminated: 'hsl(var(--border-strong))',
  found: 'var(--color-viz-found)',
};

/**
 * Opacity is a separate channel from color (Phase 5 addition).
 * `eliminated` keeps the default bar color but fades — "no longer
 * in consideration" reads more clearly as a fade than as a new
 * highlight color would, and it composes correctly with whatever
 * color the element had before elimination instead of fighting it.
 */
const STATE_OPACITY: Record<ElementVisualState, number> = {
  default: 1,
  compare: 1,
  swap: 1,
  sorted: 1,
  visited: 1,
  eliminated: 0.25,
  found: 1,
};

/**
 * Animated for Phase 3. Two distinct things are animating here,
 * and they need different Framer Motion mechanisms:
 *
 * 1. POSITION — when two elements swap, their order in
 *    `scene.elements` changes. Each bar is keyed by `element.id`
 *    (stable across the whole run, assigned once by the algorithm —
 *    see algorithms/shared/arrayElements.ts), and has `layout`
 *    enabled. Framer Motion's FLIP-based layout animation detects
 *    the DOM position change between renders and animates the bar
 *    sliding from its old slot to its new one, rather than the two
 *    slots silently swapping height/color in place.
 *
 * 2. STATE (color/height) — handled by `animate` on the inner bar,
 *    transitioning backgroundColor and height whenever `state` or
 *    `value` change for a given id.
 *
 * The flat unanimated div-grid from Phase 2 is gone; the prop
 * contract (`scene: ArraySceneDescription`) is unchanged, exactly
 * as planned — only the JSX inside changed.
 */
export function ArrayCanvas({ scene }: ArrayCanvasProps) {
  const maxValue = Math.max(...scene.elements.map((el) => el.value), 1);

  return (
    <div
      className="flex h-64 w-full items-end justify-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface px-4 py-6 sm:gap-2"
      role="img"
      aria-label="Array visualization"
    >
      {scene.elements.map((element) => (
        <motion.div
          key={element.id}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.8 }}
          className="flex min-w-6 flex-1 flex-col items-center gap-1.5 sm:min-w-8"
        >
          <motion.div
            className="w-full rounded-t-sm"
            initial={false}
            animate={{
              height: Math.max((element.value / maxValue) * 180, 4),
              backgroundColor: STATE_COLOR_VAR[element.state],
              opacity: STATE_OPACITY[element.state],
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
          <span className="font-mono text-[10px] text-muted-foreground">{element.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
