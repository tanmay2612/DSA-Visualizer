import { Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface PseudocodeViewerProps {
  pseudocode: string[];
  /** The 0-indexed line to highlight, or null/undefined for no
   *  highlight (e.g. before playback starts, or the current step's
   *  type has no mapped line). */
  activeLine: number | null | undefined;
}

/**
 * Static reference text even with no `activeLine` — useful on its
 * own before playback starts or for an algorithm with no
 * `pseudocodeLineMap`. When a line is active, it's highlighted with
 * the same amber `compare` color used throughout the canvases, so
 * "this is the line currently executing" reads as the same kind of
 * signal as "this is the element currently being compared" — one
 * consistent visual vocabulary for "active right now" across the
 * whole app, not a new color invented just for this component.
 *
 * The active line's text is a fixed dark color rather than a
 * theme-relative one (`text-background` would resolve to near-white
 * in light mode, giving poor contrast against the amber highlight —
 * checked the actual color values before picking this, not assumed).
 */
export function PseudocodeViewer({ pseudocode, activeLine }: PseudocodeViewerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Code2 className="size-3.5" />
        Pseudocode
      </div>
      <pre className="overflow-x-auto rounded-md bg-surface p-3 font-mono text-xs leading-relaxed">
        {pseudocode.map((line, index) => {
          const isActive = index === activeLine;
          return (
            <motion.div
              key={index}
              animate={{
                backgroundColor: isActive ? 'var(--color-viz-compare)' : 'transparent',
              }}
              transition={{ duration: 0.15 }}
              className={cn(
                'rounded px-2 py-0.5',
                isActive ? 'font-medium text-[#1a1303]' : 'text-foreground/85',
              )}
            >
              {line || '\u00A0'}
            </motion.div>
          );
        })}
      </pre>
    </div>
  );
}
