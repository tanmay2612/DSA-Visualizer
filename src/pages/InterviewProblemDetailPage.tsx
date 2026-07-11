import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Play, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { twoSum, maximumSubarray, validParentheses, bestTimeToBuySellStock } from '@/algorithms/interview';
import type { InterviewProblemDefinition } from '@/algorithms/interview/types';
import type { TwoSumInput } from '@/algorithms/interview/twoSum';
import type { ArrayAlgorithmStep, AlgorithmDefinition } from '@/algorithms/shared/types';
import { parseCustomArrayInput } from '@/algorithms/shared/parseCustomArrayInput';
import { arrayAdapter } from '@/engine/adapters/arrayAdapter';
import { useAlgorithmEngine } from '@/engine/useAlgorithmEngine';
import { ArrayCanvas } from '@/components/visualization';
import { ArrayInputControls, ControlPanel, TimelineSlider } from '@/components/controls';
import { PseudocodeViewer, StatsPanel, StepInfoPanel } from '@/components/panels';
import { Breadcrumb, ErrorBoundary, PageContainer, SectionHeading } from '@/components/common';
import { Badge, Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import NotFoundPage from './NotFoundPage';

const PROBLEMS: Record<string, InterviewProblemDefinition<unknown>> = {
  'two-sum': twoSum as InterviewProblemDefinition<unknown>,
  'maximum-subarray': maximumSubarray as InterviewProblemDefinition<unknown>,
  'valid-parentheses': validParentheses as InterviewProblemDefinition<unknown>,
  'best-time-to-buy-and-sell-stock': bestTimeToBuySellStock as InterviewProblemDefinition<unknown>,
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DEFAULT_SIZE = 8;

/**
 * Renders any of the four Phase 10 interview problems through the
 * exact same engine/adapter/canvas/controls pipeline as
 * AlgorithmDetailPage — the only genuinely new thing per problem is
 * the small input form below, because unlike every sorting/
 * searching algorithm, these four don't all share one input shape
 * (plain array vs. array+target vs. a bracket string). Everything
 * from the canvas downward (ControlPanel, TimelineSlider,
 * StatsPanel, StepInfoPanel, PseudocodeViewer) is the identical
 * component AlgorithmDetailPage uses, imported directly rather than
 * reimplemented.
 */
export default function InterviewProblemDetailPageRoute() {
  const { id } = useParams<{ id: string }>();
  const problem = id ? PROBLEMS[id] : undefined;

  if (!id || !problem) {
    return <NotFoundPage />;
  }

  // Keying by `id` forces a full remount when the user navigates
  // between problems, so every piece of local state below
  // (including the lazy useState initializers that seed the first
  // random input) is computed fresh per problem — without needing
  // an effect that calls setState to "re-seed" on id change, which
  // is exactly the anti-pattern the project's lint config forbids
  // (see react-hooks/set-state-in-effect). initialize() itself is
  // still called from an effect below, same as AlgorithmDetailPage,
  // because that's a call to the external AlgorithmEngine, not a
  // React setState.
  return <InterviewProblemDetail key={id} id={id} problem={problem} />;
}

interface InterviewProblemDetailProps {
  id: string;
  problem: InterviewProblemDefinition<unknown>;
}

function InterviewProblemDetail({ id, problem }: InterviewProblemDetailProps) {
  const {
    initialize,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    setSpeed,
    stepsUpToCurrent,
    allSteps,
    currentStep,
    input,
    speed,
    progress,
  } = useAlgorithmEngine<unknown>();

  // Computed once per mount (i.e. once per problem, thanks to the
  // `key={id}` remount above) — this is the single source of truth
  // for "what random input does this run start from," and both the
  // engine's initialize() effect below and the text fields' initial
  // values derive from it, so they can never disagree.
  const [initialInput] = useState(() => problem.generateRandomInput(DEFAULT_SIZE));

  const [arrayText, setArrayText] = useState(() =>
    id === 'two-sum'
      ? (initialInput as TwoSumInput).array.join(', ')
      : id === 'valid-parentheses'
        ? ''
        : (initialInput as number[]).join(', '),
  );
  const [targetText, setTargetText] = useState(() =>
    id === 'two-sum' ? String((initialInput as TwoSumInput).target) : '',
  );
  const [stringText, setStringText] = useState(() =>
    id === 'valid-parentheses' ? (initialInput as string) : '',
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    initialize(problem as AlgorithmDefinition<unknown>, initialInput);
    // Runs once on mount (and once per remount via the `key={id}`
    // wrapper) — initialInput/problem are stable for this
    // component's lifetime by construction, so depending on them
    // alone (rather than every render) is correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = useCallback(() => play(), [play]);
  const handleJumpToEnd = useCallback(() => {
    jumpToStep(progress.totalSteps - 1);
  }, [jumpToStep, progress.totalSteps]);

  function applyInputFromForm(): unknown | null {
    if (!id) return null;

    if (id === 'two-sum') {
      const parsedArray = parseCustomArrayInput(arrayText);
      if (parsedArray.error || !parsedArray.values) {
        setFormError(parsedArray.error);
        return null;
      }
      const target = Number(targetText.trim());
      if (Number.isNaN(target)) {
        setFormError('Target must be a number.');
        return null;
      }
      setFormError(null);
      const value: TwoSumInput = { array: parsedArray.values, target };
      return value;
    }

    if (id === 'valid-parentheses') {
      const trimmed = stringText.trim();
      if (trimmed.length === 0 || !/^[()[\]{}]+$/.test(trimmed)) {
        setFormError('Enter only the characters ( ) [ ] { }.');
        return null;
      }
      setFormError(null);
      return trimmed;
    }

    // maximum-subarray / best-time-to-buy-and-sell-stock: plain number[]
    const parsed = parseCustomArrayInput(arrayText);
    if (parsed.error || !parsed.values) {
      setFormError(parsed.error);
      return null;
    }
    setFormError(null);
    return parsed.values;
  }

  function handleRun() {
    if (!problem) return;
    const value = applyInputFromForm();
    if (value === null) return;
    initialize(problem as AlgorithmDefinition<unknown>, value);
    // "Run" surfaces the final answer immediately rather than
    // requiring the user to step/play through the whole trace —
    // jumpToStep is the same engine capability Feature 4's timeline
    // uses, just invoked programmatically here instead of by drag.
    // initialize() and jumpToStep() both mutate the same synchronous
    // AlgorithmEngine instance directly (it isn't React state), so
    // this call already sees the freshly-initialized step list.
    jumpToStep(Number.MAX_SAFE_INTEGER);
  }

  function handleVisualize() {
    if (!problem) return;
    const value = applyInputFromForm();
    if (value === null) return;
    initialize(problem as AlgorithmDefinition<unknown>, value);
  }

  const scene = useMemo(
    () =>
      arrayAdapter(stepsUpToCurrent as ArrayAlgorithmStep[], allSteps as ArrayAlgorithmStep[]),
    [stepsUpToCurrent, allSteps],
  );

  return (
    <PageContainer className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Home', path: ROUTES.home },
          { label: 'Interview Prep', path: ROUTES.interview },
          { label: problem.name },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading eyebrow="interview problem" title={problem.name} description={problem.problemStatement} />
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{DIFFICULTY_LABEL[problem.difficulty]}</Badge>
          {problem.topics.map((topic) => (
            <Badge key={topic} variant="muted">
              {topic}
            </Badge>
          ))}
          <Badge variant="mono">time: {problem.complexity.time.average}</Badge>
          <Badge variant="mono">space: {problem.complexity.space}</Badge>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-sm">
        <p className="font-medium text-foreground">Example</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Input: {problem.example.input}</p>
        <p className="font-mono text-xs text-muted-foreground">Output: {problem.example.output}</p>
        {problem.example.explanation && (
          <p className="mt-1 text-xs text-muted-foreground">{problem.example.explanation}</p>
        )}
      </div>

      {id === 'two-sum' && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            Custom input
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={arrayText}
              onChange={(e) => setArrayText(e.target.value)}
              placeholder="Array: 2,7,11,15"
              aria-label="Two Sum array input"
            />
            <Input
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              placeholder="Target: 9"
              aria-label="Two Sum target input"
              className="sm:w-32"
            />
          </div>
        </div>
      )}

      {id === 'valid-parentheses' && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            Custom input
          </span>
          <Input
            value={stringText}
            onChange={(e) => setStringText(e.target.value)}
            placeholder="Brackets: {[()]}"
            aria-label="Valid Parentheses string input"
          />
        </div>
      )}

      {(id === 'maximum-subarray' || id === 'best-time-to-buy-and-sell-stock') && (
        <ArrayInputControls
          size={Array.isArray(input) ? input.length : DEFAULT_SIZE}
          onApply={(values) => {
            setArrayText(values.join(', '));
            initialize(problem as AlgorithmDefinition<unknown>, values);
          }}
        />
      )}

      {(id === 'two-sum' || id === 'valid-parentheses') && (
        <div className="-mt-3 flex flex-wrap items-center gap-2">
          {formError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              {formError}
            </p>
          )}
          <Button size="sm" variant="outline" className="ml-auto" onClick={handleRun}>
            <Play className="size-3.5" />
            Run
          </Button>
          <Button size="sm" onClick={handleVisualize}>
            Visualize
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <ErrorBoundary variant="inline" label="visualization">
            <ArrayCanvas scene={scene} />
          </ErrorBoundary>
          <StepInfoPanel step={currentStep} algorithmName={problem.name} />
        </div>

        <PseudocodeViewer
          pseudocode={problem.pseudocode}
          activeLine={
            currentStep && problem.pseudocodeLineMap ? problem.pseudocodeLineMap[currentStep.type] : null
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
          onRandomize={() => {
            const generated = problem.generateRandomInput(DEFAULT_SIZE);
            initialize(problem as AlgorithmDefinition<unknown>, generated);
            if (id === 'two-sum') {
              const twoSumValue = generated as TwoSumInput;
              setArrayText(twoSumValue.array.join(', '));
              setTargetText(String(twoSumValue.target));
            } else if (id === 'valid-parentheses') {
              setStringText(generated as string);
            } else {
              setArrayText((generated as number[]).join(', '));
            }
          }}
        />
        <TimelineSlider
          currentIndex={progress.currentIndex}
          totalSteps={progress.totalSteps}
          onJumpToStep={jumpToStep}
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
