import type { ArraySceneDescription, ElementVisualState } from '@/types/visualization.types';
import { cn } from '@/lib/cn';

interface ArrayCanvasProps {
  scene: ArraySceneDescription;
}

const STATE_COLOR_CLASS: Record<ElementVisualState, string> = {
  default: 'bg-border-strong',
  compare: 'bg-viz-compare',
  swap: 'bg-viz-swap',
  sorted: 'bg-viz-sorted',
  visited: 'bg-viz-visited',
};

/**
 * Deliberately unanimated for Phase 2 — a flat re-render on every
 * step, plain colored bars. This is the "ugly but functionally
 * complete" canvas the roadmap calls for; Framer Motion transitions
 * between states are added in Phase 3 without changing this
 * component's props or the adapter contract it consumes, only the
 * JSX inside it.
 *
 * Pure renderer: no knowledge of which algorithm produced `scene`,
 * no knowledge of "compare" meaning anything beyond "render this
 * color." That's the whole point of the SceneDescription boundary.
 */
export function ArrayCanvas({ scene }: ArrayCanvasProps) {
  const maxValue = Math.max(...scene.elements.map((el) => el.value), 1);

  return (
    <div
      className="flex h-64 w-full items-end justify-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface px-4 py-6 sm:gap-2"
      role="img"
      aria-label="Array visualization"
    >
      {scene.elements.map((element, index) => (
        <div key={index} className="flex min-w-6 flex-1 flex-col items-center gap-1.5 sm:min-w-8">
          <div
            className={cn(
              'w-full rounded-t-sm transition-colors',
              STATE_COLOR_CLASS[element.state],
            )}
            style={{ height: `${Math.max((element.value / maxValue) * 180, 4)}px` }}
          />
          <span className="font-mono text-[10px] text-muted-foreground">{element.value}</span>
        </div>
      ))}
    </div>
  );
}
