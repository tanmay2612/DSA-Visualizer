import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * The hero's signature element. Rather than a generic gradient or
 * abstract shape, this renders an actual tiny array — bars that
 * highlight in the amber "compare" color and swap places — so the
 * very first thing a visitor sees is a literal, honest preview of
 * the product, not a decorative stand-in for it.
 *
 * This is self-contained mock data, not the real algorithm engine
 * (that doesn't exist until Phase 2) — intentionally so. It loops
 * a fixed, hand-authored sequence of states.
 */

interface BarState {
  values: number[];
  activeIndices: [number, number] | null;
  sortedUpTo: number;
}

const SEQUENCE: BarState[] = [
  { values: [5, 2, 8, 1, 9, 3], activeIndices: [0, 1], sortedUpTo: -1 },
  { values: [2, 5, 8, 1, 9, 3], activeIndices: [1, 2], sortedUpTo: -1 },
  { values: [2, 5, 8, 1, 9, 3], activeIndices: [2, 3], sortedUpTo: -1 },
  { values: [2, 5, 1, 8, 9, 3], activeIndices: [3, 4], sortedUpTo: -1 },
  { values: [2, 5, 1, 8, 9, 3], activeIndices: [4, 5], sortedUpTo: -1 },
  { values: [2, 5, 1, 8, 3, 9], activeIndices: null, sortedUpTo: 5 },
  { values: [2, 1, 5, 8, 3, 9], activeIndices: [1, 2], sortedUpTo: 5 },
  { values: [2, 1, 5, 3, 8, 9], activeIndices: [3, 4], sortedUpTo: 5 },
  { values: [1, 2, 5, 3, 8, 9], activeIndices: [0, 1], sortedUpTo: 5 },
  { values: [1, 2, 3, 5, 8, 9], activeIndices: [2, 3], sortedUpTo: 5 },
  { values: [1, 2, 3, 5, 8, 9], activeIndices: null, sortedUpTo: 5 },
];

const STEP_DURATION_MS = 850;
const MAX_VALUE = 9;

function getInitialReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(getInitialReducedMotionPreference);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return prefersReduced;
}

export function HeroVisualization() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % SEQUENCE.length);
    }, STEP_DURATION_MS);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  // Reduced motion: hold on the final, fully-sorted frame instead
  // of looping continuously.
  const step = prefersReducedMotion ? SEQUENCE[SEQUENCE.length - 1] : SEQUENCE[stepIndex];

  return (
    <div
      className="flex h-48 w-full items-end justify-center gap-3 rounded-xl border border-border bg-surface px-8 py-6 sm:gap-4"
      role="img"
      aria-label="Animated preview of a sorting algorithm visualization"
    >
      {step.values.map((value, index) => {
        const isActive = step.activeIndices?.includes(index) ?? false;
        const isSorted = index <= step.sortedUpTo;

        return (
          <motion.div key={index} className="flex w-8 flex-col items-center gap-1.5 sm:w-10">
            <motion.div
              className="w-full rounded-t-sm"
              animate={{
                height: `${(value / MAX_VALUE) * 120}px`,
                backgroundColor: isActive
                  ? 'var(--color-viz-compare)'
                  : isSorted
                    ? 'var(--color-viz-sorted)'
                    : 'hsl(var(--border-strong))',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">{value}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
