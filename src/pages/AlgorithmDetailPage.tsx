import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getAlgorithmById } from '@/algorithms/registry';
import { arrayAdapter } from '@/engine/adapters/arrayAdapter';
import { useAlgorithmEngine } from '@/engine/useAlgorithmEngine';
import type { ArrayAlgorithmStep } from '@/algorithms/shared/types';
import { ArrayCanvas } from '@/components/visualization';
import { ControlPanel } from '@/components/controls';
import { StatsPanel } from '@/components/panels';
import { Breadcrumb, PageContainer, SectionHeading } from '@/components/common';
import { Badge } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from './NotFoundPage';

const DEFAULT_INPUT_SIZE = 12;

/**
 * The Phase 2 deliverable: one algorithm, fully playable end to end.
 * No Framer Motion here yet (Phase 3) — ArrayCanvas re-renders flat
 * colored bars on every step. The point of this page is proving the
 * engine -> adapter -> canvas -> controls pipeline actually works,
 * not making it pretty.
 *
 * Only array-visualization algorithms are handled here for now —
 * graph/tree routing through this same page lands in Phases 6/7,
 * branching on `algorithm.visualizationType` once those adapters
 * and canvases exist.
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
    setSpeed,
    randomizeInput,
    stepsUpToCurrent,
    input,
    speed,
    progress,
  } = useAlgorithmEngine<number[]>();

  useEffect(() => {
    if (!algorithm) return;
    initialize(algorithm, algorithm.generateRandomInput(DEFAULT_INPUT_SIZE));
  }, [algorithm, initialize]);

  if (!algorithm || algorithm.visualizationType !== 'array') {
    return <NotFoundPage />;
  }

  const scene = arrayAdapter(stepsUpToCurrent as ArrayAlgorithmStep[], input ?? []);

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
          description="Step through the algorithm using the controls below, or press play to watch it run automatically."
        />
        <div className="flex gap-2">
          <Badge variant="mono">time: {algorithm.complexity.time.average}</Badge>
          <Badge variant="mono">space: {algorithm.complexity.space}</Badge>
        </div>
      </div>

      <ArrayCanvas scene={scene} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ControlPanel
          isPlaying={progress.isPlaying}
          isFinished={progress.isFinished}
          canStepBackward={progress.currentIndex > -1}
          speed={speed}
          onPlay={() => play()}
          onPause={pause}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onSpeedChange={setSpeed}
          onRandomize={() => randomizeInput(DEFAULT_INPUT_SIZE)}
        />
        <StatsPanel currentIndex={progress.currentIndex} totalSteps={progress.totalSteps} />
      </div>
    </PageContainer>
  );
}
