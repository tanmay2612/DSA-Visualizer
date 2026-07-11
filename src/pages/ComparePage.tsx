import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, GitCompareArrows, Loader2, PlayCircle } from 'lucide-react';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { selectionSort } from '@/algorithms/sorting/selectionSort';
import { insertionSort } from '@/algorithms/sorting/insertionSort';
import { generateRandomArray } from '@/algorithms/shared/generateRandomInput';
import type { ArrayAlgorithmStep, AlgorithmDefinition } from '@/algorithms/shared/types';
import { arrayAdapter } from '@/engine/adapters/arrayAdapter';
import { useAlgorithmEngine } from '@/engine/useAlgorithmEngine';
import { ArrayCanvas } from '@/components/visualization';
import { ArrayInputControls, ControlPanel } from '@/components/controls';
import { Breadcrumb, ErrorBoundary, PageContainer, SectionHeading } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Comparison Mode (Phase 10, Feature 3). Scoped to sorting only, per
 * the phase brief — bubble/selection/insertion required, merge/quick
 * left out because their traces (recursive, divide-and-conquer)
 * don't line up on a shared linear timeline as cleanly as the three
 * simple O(n²) sorts do, and the brief explicitly marks those two as
 * "optional only if existing traces make it easy."
 *
 * Architecturally this is exactly what useAlgorithmEngine's own doc
 * comment already anticipated (see its "ComparePage renders this
 * hook twice — independently" note): one AlgorithmEngine instance
 * per lane, each with its own independent play/pause/step state, all
 * driven by one set of shared controls. No new engine capability was
 * needed — this page only had to call the hook three times instead
 * of once and fan shared button clicks out to each instance.
 */

interface Lane {
  id: string;
  definition: AlgorithmDefinition<number[]>;
}

const LANES: Lane[] = [
  { id: 'bubble-sort', definition: bubbleSort },
  { id: 'selection-sort', definition: selectionSort },
  { id: 'insertion-sort', definition: insertionSort },
];

const DEFAULT_ARRAY_SIZE = 8;

function countStepsOfKind(steps: ArrayAlgorithmStep[], predicate: (type: string) => boolean) {
  return steps.reduce((count, step) => (predicate(step.type) ? count + 1 : count), 0);
}

export default function ComparePage() {
  // Three independent engine instances, always constructed — never
  // conditionally, so React's rules of hooks stay satisfied even
  // though only 2 or 3 of them may be "selected" at any moment. An
  // unselected lane's engine simply never gets initialize() called
  // on it and its column isn't rendered; it costs nothing to exist.
  const engineBubble = useAlgorithmEngine<number[]>();
  const engineSelection = useAlgorithmEngine<number[]>();
  const engineInsertion = useAlgorithmEngine<number[]>();

  const engines = useMemo(
    () => ({
      'bubble-sort': engineBubble,
      'selection-sort': engineSelection,
      'insertion-sort': engineInsertion,
    }),
    [engineBubble, engineSelection, engineInsertion],
  );

  const [sharedArray, setSharedArray] = useState<number[]>(() =>
    generateRandomArray(DEFAULT_ARRAY_SIZE),
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(LANES.map((lane) => lane.id)),
  );
  const [hasCompared, setHasCompared] = useState(false);
  const [speed, setSpeedState] = useState(1);

  const activeLanes = LANES.filter((lane) => selectedIds.has(lane.id));

  function toggleLane(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 2) return prev; // require at least 2 selected
        next.delete(id);
      } else {
        if (next.size >= 3) return prev; // cap at 3
        next.add(id);
      }
      return next;
    });
  }

  const handleCompare = useCallback(() => {
    for (const lane of LANES) {
      if (selectedIds.has(lane.id)) {
        engines[lane.id as keyof typeof engines].initialize(lane.definition, sharedArray);
      }
    }
    setHasCompared(true);
  }, [engines, selectedIds, sharedArray]);

  const handlePlay = useCallback(() => {
    activeLanes.forEach((lane) => engines[lane.id as keyof typeof engines].play(speed));
  }, [activeLanes, engines, speed]);

  const handlePause = useCallback(() => {
    activeLanes.forEach((lane) => engines[lane.id as keyof typeof engines].pause());
  }, [activeLanes, engines]);

  const handleReset = useCallback(() => {
    activeLanes.forEach((lane) => engines[lane.id as keyof typeof engines].reset());
  }, [activeLanes, engines]);

  const handleSpeedChange = useCallback(
    (nextSpeed: number) => {
      setSpeedState(nextSpeed);
      activeLanes.forEach((lane) => engines[lane.id as keyof typeof engines].setSpeed(nextSpeed));
    },
    [activeLanes, engines],
  );

  const anyPlaying = activeLanes.some(
    (lane) => engines[lane.id as keyof typeof engines].progress.isPlaying,
  );
  const anyStepped = activeLanes.some(
    (lane) => engines[lane.id as keyof typeof engines].progress.currentIndex > -1,
  );
  const allFinished =
    hasCompared &&
    activeLanes.length > 0 &&
    activeLanes.every((lane) => engines[lane.id as keyof typeof engines].progress.isFinished);

  return (
    <PageContainer className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'Compare' }]} />

      <SectionHeading
        eyebrow="sorting"
        title="Compare Algorithms"
        description="Run two or three sorting algorithms on the exact same array, side by side, with shared playback controls. Great for screenshots and explaining trade-offs in interviews."
      />

      <ArrayInputControls
        size={sharedArray.length}
        onApply={(values) => {
          setSharedArray(values);
          setHasCompared(false);
        }}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <span className="text-xs font-medium text-muted-foreground">
          Algorithms (choose 2–3):
        </span>
        {LANES.map((lane) => {
          const selected = selectedIds.has(lane.id);
          return (
            <button
              key={lane.id}
              type="button"
              onClick={() => toggleLane(lane.id)}
              aria-pressed={selected}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                selected
                  ? 'border-transparent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:bg-surface-hover',
              )}
            >
              {lane.definition.name}
            </button>
          );
        })}
        <Button size="sm" className="ml-auto" onClick={handleCompare}>
          <GitCompareArrows className="size-4" />
          Compare
        </Button>
      </div>

      {!hasCompared ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <GitCompareArrows className="size-8 text-muted-foreground/60" />
          Pick 2 or 3 algorithms and an array above, then click Compare.
        </div>
      ) : (
        <>
          <ControlPanel
            isPlaying={anyPlaying}
            isFinished={allFinished}
            canStepBackward={anyStepped}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={() =>
              activeLanes.forEach((lane) => engines[lane.id as keyof typeof engines].stepForward())
            }
            onStepBackward={() =>
              activeLanes.forEach((lane) =>
                engines[lane.id as keyof typeof engines].stepBackward(),
              )
            }
            onReset={handleReset}
            onJumpToEnd={() =>
              activeLanes.forEach((lane) => {
                const engine = engines[lane.id as keyof typeof engines];
                engine.jumpToStep(engine.progress.totalSteps - 1);
              })
            }
            onSpeedChange={handleSpeedChange}
            onRandomize={() => {
              const next = generateRandomArray(sharedArray.length);
              setSharedArray(next);
              setHasCompared(false);
            }}
          />

          <div
            className={cn(
              'grid gap-4',
              activeLanes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
            )}
          >
            {activeLanes.map((lane) => {
              const engine = engines[lane.id as keyof typeof engines];
              const steps = engine.stepsUpToCurrent as ArrayAlgorithmStep[];
              const comparisons = countStepsOfKind(steps, (t) => t.includes('compare'));
              const swaps = countStepsOfKind(steps, (t) => t === 'swap');
              const { progress } = engine;

              return (
                <div
                  key={lane.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{lane.definition.name}</span>
                    {progress.isFinished ? (
                      <span
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--color-viz-sorted)' }}
                      >
                        <CheckCircle2 className="size-3.5" /> Done
                      </span>
                    ) : progress.isPlaying ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-accent">
                        <Loader2 className="size-3.5 animate-spin" /> Running
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <PlayCircle className="size-3.5" /> Ready
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="mono">time: {lane.definition.complexity.time.average}</Badge>
                    <Badge variant="mono">space: {lane.definition.complexity.space}</Badge>
                  </div>

                  <ErrorBoundary variant="inline" label="visualization">
                    <ArrayCanvas scene={arrayAdapter(steps, engine.allSteps as ArrayAlgorithmStep[])} />
                  </ErrorBoundary>

                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px] text-muted-foreground">
                    <div className="rounded-md border border-border bg-surface py-1.5">
                      <div className="font-medium text-foreground">{comparisons}</div>
                      comparisons
                    </div>
                    <div className="rounded-md border border-border bg-surface py-1.5">
                      <div className="font-medium text-foreground">{swaps}</div>
                      swaps
                    </div>
                    <div className="rounded-md border border-border bg-surface py-1.5">
                      <div className="font-medium text-foreground">
                        {Math.max(progress.currentIndex + 1, 0)}/{progress.totalSteps}
                      </div>
                      steps
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Step counts and comparison/swap counts reflect the algorithms' recorded execution
            traces, not wall-clock animation time — animation speed is a display setting, not a
            measurement of actual algorithm runtime.
          </p>
        </>
      )}
    </PageContainer>
  );
}
