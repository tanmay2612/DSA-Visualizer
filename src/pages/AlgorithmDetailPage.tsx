import { useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getAlgorithmById } from '@/algorithms/registry';
import { arrayAdapter } from '@/engine/adapters/arrayAdapter';
import { graphAdapter } from '@/engine/adapters/graphAdapter';
import { treeAdapter } from '@/engine/adapters/treeAdapter';
import { useAlgorithmEngine } from '@/engine/useAlgorithmEngine';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type {
  ArrayAlgorithmStep,
  Graph,
  GraphAlgorithmStep,
  TreeAlgorithmStep,
} from '@/algorithms/shared/types';
import { ArrayCanvas, GraphCanvas, TreeCanvas } from '@/components/visualization';
import { ArrayInputControls, ControlPanel } from '@/components/controls';
import { PseudocodeViewer, StepInfoPanel, StatsPanel } from '@/components/panels';
import { Breadcrumb, ErrorBoundary, PageContainer, SectionHeading } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';
import NotFoundPage from './NotFoundPage';

const DEFAULT_INPUT_SIZE = 12;
const DEFAULT_GRAPH_NODE_COUNT = 8;
const DEFAULT_TREE_NODE_COUNT = 9;

/**
 * One algorithm, fully playable end to end, branching on
 * `algorithm.visualizationType` to render the array pipeline
 * (Phases 2-5: ArrayCanvas + arrayAdapter), the graph pipeline
 * (Phase 6: GraphCanvas + graphAdapter), or the tree pipeline
 * (Phase 7: TreeCanvas + treeAdapter). The engine, controls, and
 * page shell below are entirely visualization-type-agnostic — they
 * only deal in `progress`, `stepsUpToCurrent`, and playback actions,
 * none of which differ across array/graph/tree runs. Only the
 * canvas + adapter pairing changes, which is exactly the separation
 * the architecture's "engine knows nothing about rendering"
 * boundary was designed to make possible — three visualization
 * types in, and this page's core wiring (everything below the
 * `canvas` variable) hasn't needed to change since Phase 2.
 */
export default function AlgorithmDetailPage() {
  const { category, name } = useParams<{ category: string; name: string }>();

  // getAlgorithmById returns the same object reference for the same
  // id (the registry Map is built once at module load), but memoizing
  // here keys the lookup explicitly on `name` so the effect below has
  // a correctly-scoped, lint-clean dependency rather than relying on
  // that implementation detail implicitly.
  const algorithm = useMemo(() => (name ? getAlgorithmById(name) : undefined), [name]);

  const {
    initialize,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    setSpeed,
    randomizeInput,
    stepsUpToCurrent,
    allSteps,
    currentStep,
    input,
    speed,
    progress,
  } = useAlgorithmEngine<unknown>();

  const isFavorite = useFavoritesStore((state) =>
    algorithm ? state.isFavorite(algorithm.id) : false,
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Different visualization types want different "size" semantics
  // for the same generateRandomInput(size) call — array length,
  // graph node count, or tree node count all produce visually
  // reasonable results at different magnitudes, so visualizationType
  // picks which default applies at initialization and randomization
  // time, the same branching introduced for graphs in Phase 6.
  const defaultSize =
    algorithm?.visualizationType === 'graph'
      ? DEFAULT_GRAPH_NODE_COUNT
      : algorithm?.visualizationType === 'tree'
        ? DEFAULT_TREE_NODE_COUNT
        : DEFAULT_INPUT_SIZE;

  useEffect(() => {
    if (!algorithm) return;
    initialize(algorithm, algorithm.generateRandomInput(defaultSize));
    // defaultSize is derived from `algorithm` itself (via
    // visualizationType), so depending on `algorithm` alone is
    // sufficient and avoids re-running this effect for a value that
    // only ever changes when algorithm does anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, initialize]);

  // Applies a user-chosen input shape or custom array directly,
  // bypassing algorithm.generateRandomInput entirely — the user has
  // already supplied the exact array they want to see, there's
  // nothing to generate. Only meaningful for array-visualization
  // algorithms (ArrayInputControls is only rendered for those), but
  // the function itself doesn't need to branch on visualizationType
  // since initialize() is already generic over TInput.
  const handleApplyArrayInput = useCallback(
    (values: number[]) => {
      if (!algorithm) return;
      initialize(algorithm, values);
    },
    [algorithm, initialize],
  );

  // Wrapped to strip arguments: `play` accepts an optional speed
  // override, but onClick/keyboard handlers must never forward a
  // SyntheticEvent or KeyboardEvent into that parameter — that was
  // a real bug here until caught (play(syntheticEvent) corrupts
  // the engine's speed state, since the engine divides by it).
  // useCallback keeps this stable across renders so the keyboard
  // listener below isn't torn down and reattached every render.
  const handlePlay = useCallback(() => play(), [play]);

  // Jumps straight to the final step using the engine's existing
  // jumpToStep — no new engine capability needed, this is purely
  // new UI wiring onto something that already worked.
  const handleJumpToEnd = useCallback(() => {
    jumpToStep(progress.totalSteps - 1);
  }, [jumpToStep, progress.totalSteps]);

  // play/pause/stepForward/stepBackward/reset are all stable
  // (memoized inside useAlgorithmEngine), so this listener is
  // attached once per mount, not re-attached on every render.
  useKeyboardShortcuts({
    isPlaying: progress.isPlaying,
    isFinished: progress.isFinished,
    canStepBackward: progress.currentIndex > -1,
    onPlay: handlePlay,
    onPause: pause,
    onStepForward: stepForward,
    onStepBackward: stepBackward,
    onReset: reset,
    onJumpToEnd: handleJumpToEnd,
    enabled: Boolean(algorithm),
  });

  if (
    !algorithm ||
    (algorithm.visualizationType !== 'array' &&
      algorithm.visualizationType !== 'graph' &&
      algorithm.visualizationType !== 'tree')
  ) {
    return <NotFoundPage />;
  }

  const canvas =
    algorithm.visualizationType === 'array' ? (
      <ArrayCanvas
        scene={arrayAdapter(
          stepsUpToCurrent as ArrayAlgorithmStep[],
          allSteps as ArrayAlgorithmStep[],
        )}
      />
    ) : algorithm.visualizationType === 'graph' ? (
      <GraphCanvas
        scene={graphAdapter(
          (input as { graph: Graph } | null)?.graph ?? { nodes: [], edges: [] },
          stepsUpToCurrent as GraphAlgorithmStep[],
        )}
      />
    ) : (
      <TreeCanvas scene={treeAdapter(stepsUpToCurrent as TreeAlgorithmStep[])} />
    );

  return (
    <PageContainer className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Home', path: ROUTES.home },
          { label: 'Algorithms', path: ROUTES.algorithms },
          {
            label: category ?? algorithm.category,
            path: ROUTES.algorithmsByCategory(algorithm.category),
          },
          { label: algorithm.name },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow={algorithm.category}
          title={algorithm.name}
          description="Step through the algorithm using the controls below or the keyboard — space to play/pause, arrow keys to step, R to jump to start, End to jump to end, Esc to pause."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleFavorite(algorithm.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('size-4', isFavorite && 'fill-accent text-accent')} />
          </Button>
          <Badge variant="mono">time: {algorithm.complexity.time.average}</Badge>
          <Badge variant="mono">space: {algorithm.complexity.space}</Badge>
        </div>
      </div>

      {algorithm.visualizationType === 'array' && (
        <ArrayInputControls
          size={Array.isArray(input) ? input.length : defaultSize}
          onApply={handleApplyArrayInput}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={algorithm.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorBoundary variant="inline" label="visualization" key={algorithm.id}>
                {canvas}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>

          <StepInfoPanel step={currentStep} algorithmName={algorithm.name} />
        </div>

        <PseudocodeViewer
          pseudocode={algorithm.pseudocode}
          activeLine={
            currentStep && algorithm.pseudocodeLineMap
              ? algorithm.pseudocodeLineMap[currentStep.type]
              : null
          }
        />
      </div>

      <div className="flex flex-col gap-4">
        <ControlPanel
          isPlaying={progress.isPlaying}
          isFinished={progress.isFinished}
          canStepBackward={progress.currentIndex > -1}
          speed={speed}
          onPlay={handlePlay}
          onPause={pause}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onJumpToEnd={handleJumpToEnd}
          onSpeedChange={setSpeed}
          onRandomize={() => randomizeInput(defaultSize)}
        />
        <StatsPanel
          currentIndex={progress.currentIndex}
          totalSteps={progress.totalSteps}
          isPlaying={progress.isPlaying}
          isFinished={progress.isFinished}
          speed={speed}
          stepsUpToCurrent={stepsUpToCurrent}
        />
      </div>
    </PageContainer>
  );
}
