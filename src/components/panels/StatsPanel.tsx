import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Gauge,
  GitCompare,
  Hash,
  type LucideIcon,
  PauseCircle,
  PlayCircle,
  Timer,
} from 'lucide-react';
import type { AlgorithmStep } from '@/algorithms/shared/types';
import { cn } from '@/lib/cn';

interface StatsPanelProps {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isFinished: boolean;
  speed: number;
  /** Steps so far, used only to derive comparison/mutation counts —
   *  read-only consumption of data the page already has, no new
   *  engine state needed. */
  stepsUpToCurrent: AlgorithmStep[];
}

/**
 * Generic, visualization-type-agnostic classification: any step
 * whose `type` contains "compare" counts as a comparison
 * (`compare`, `compare-target` both match); any step that
 * represents a structural change counts as a mutation (`swap`,
 * `overwrite`, `restructure`). This works identically for array,
 * graph, and tree steps without StatsPanel needing to import or
 * know about any of their specific union members — exactly the
 * kind of cross-cutting concern that should stay decoupled from
 * the per-visualization-type step vocabularies.
 */
const MUTATION_STEP_TYPES = new Set(['swap', 'overwrite', 'restructure']);

function countByPredicate(
  steps: AlgorithmStep[],
  predicate: (step: AlgorithmStep) => boolean,
): number {
  return steps.reduce((count, step) => (predicate(step) ? count + 1 : count), 0);
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2">
      <Icon className={cn('size-4 shrink-0', accent ? 'text-accent' : 'text-muted-foreground')} />
      <div className="flex flex-col leading-tight">
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

/**
 * Upgraded for the Phase 7 polish pass — was a single "Step X / Y"
 * line, now a small grid of stat cards. Every value here is either
 * already available on `progress`/`speed` (no engine changes) or
 * derived from `stepsUpToCurrent`, which the page already has and
 * was already passing to adapters — StatsPanel just reads the same
 * data for a different purpose. Elapsed time is tracked locally
 * with a ref + interval, entirely at the component level, rather
 * than adding timestamp tracking to AlgorithmEngine.
 */
export function StatsPanel({
  currentIndex,
  totalSteps,
  isPlaying,
  isFinished,
  speed,
  stepsUpToCurrent,
}: StatsPanelProps) {
  const displayStep = Math.max(currentIndex + 1, 0);

  // Re-scanning the full step history is O(n) in the run length;
  // memoizing avoids redoing that scan on renders where
  // stepsUpToCurrent itself hasn't changed (e.g. a parent re-render
  // triggered by unrelated state). Keyed on the array reference,
  // which the engine already creates fresh only when the step
  // position actually changes (see AlgorithmEngine.stepsUpToCurrent).
  const comparisons = useMemo(
    () => countByPredicate(stepsUpToCurrent, (s) => s.type.includes('compare')),
    [stepsUpToCurrent],
  );
  const mutations = useMemo(
    () => countByPredicate(stepsUpToCurrent, (s) => MUTATION_STEP_TYPES.has(s.type)),
    [stepsUpToCurrent],
  );

  const [elapsedMs, setElapsedMs] = useState(0);
  const accumulatedRef = useRef(0);
  const playStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (playStartRef.current !== null) {
        accumulatedRef.current += Date.now() - playStartRef.current;
        playStartRef.current = null;
      }
      return;
    }

    playStartRef.current = Date.now();
    const interval = window.setInterval(() => {
      const start = playStartRef.current;
      if (start !== null) {
        setElapsedMs(accumulatedRef.current + (Date.now() - start));
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  // Reset the clock whenever the run goes back to its starting
  // position (reset(), or a freshly-initialized algorithm). Only
  // the refs are reset here — `elapsedMs` itself is derived at
  // render time as `isAtStart ? 0 : elapsedMs` below, rather than
  // calling setState synchronously inside this effect, which would
  // trigger an extra cascading render for no benefit.
  const isAtStart = currentIndex === -1;
  useEffect(() => {
    if (isAtStart) {
      accumulatedRef.current = 0;
      playStartRef.current = isPlaying ? Date.now() : null;
    }
  }, [isAtStart, isPlaying]);

  const displayedElapsedMs = isAtStart ? 0 : elapsedMs;

  const status = isFinished ? 'Finished' : isPlaying ? 'Playing' : 'Paused';
  const StatusIcon = isFinished ? CheckCircle2 : isPlaying ? PlayCircle : PauseCircle;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard icon={Hash} label="Step" value={`${displayStep} / ${totalSteps}`} accent />
      <StatCard icon={GitCompare} label="Comparisons" value={String(comparisons)} />
      <StatCard icon={GitCompare} label="Mutations" value={String(mutations)} />
      <StatCard icon={Timer} label="Elapsed" value={formatElapsed(displayedElapsedMs)} />
      <StatCard icon={Gauge} label="Speed" value={`${speed}x`} />
      <StatCard icon={StatusIcon} label="Status" value={status} accent={isFinished} />
    </div>
  );
}
