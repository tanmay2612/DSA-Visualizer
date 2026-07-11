import { useState } from 'react';
import { AlertCircle, CheckCircle2, FlaskConical, Play, Wand2, XCircle } from 'lucide-react';
import type { AlgorithmDefinition } from '@/algorithms/shared/types';
import { arraysEqual, computeSortedResult, SORTING_TEST_CASES } from '@/algorithms/shared/testCases';
import { parseCustomArrayInput } from '@/algorithms/shared/parseCustomArrayInput';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

interface TestCasePanelProps {
  algorithm: AlgorithmDefinition<number[]>;
  /** Sends a case's input into the existing visualization engine —
   *  this panel never runs its own copy of the algorithm for
   *  playback, only for the instant pass/fail check (see
   *  computeSortedResult's doc comment). */
  onVisualize: (input: number[]) => void;
}

interface RunResult {
  actual: number[];
  pass: boolean;
}

/**
 * Test Case Panel (Phase 10, Feature 1). Extends the existing
 * custom-array-input system (ArrayInputControls) rather than
 * replacing it — this panel only adds sample/edge cases with known
 * expected output and a Pass/Fail check, and a "Visualize" action
 * that hands a case's input to the same `onApply`-style callback
 * AlgorithmDetailPage already wires up for custom input. No
 * backend, no persisted test history — results live in component
 * state and reset on reload, which is all a portfolio demo needs.
 *
 * Only rendered for sorting algorithms (AlgorithmDetailPage decides
 * this), since "expected output" only has one unambiguous meaning
 * there — the fully sorted array — without needing per-algorithm
 * target values the way searching would.
 */
export function TestCasePanel({ algorithm, onVisualize }: TestCasePanelProps) {
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [customInput, setCustomInput] = useState('');
  const [customExpected, setCustomExpected] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [customResult, setCustomResult] = useState<RunResult | null>(null);

  function runCase(id: string, input: number[], expected: number[]) {
    const actual = computeSortedResult(algorithm, input);
    setResults((prev) => ({ ...prev, [id]: { actual, pass: arraysEqual(actual, expected) } }));
  }

  function runCustomCase() {
    const parsedInput = parseCustomArrayInput(customInput);
    if (parsedInput.error || !parsedInput.values) {
      setCustomError(parsedInput.error);
      setCustomResult(null);
      return;
    }

    let expected: number[];
    if (customExpected.trim().length === 0) {
      expected = [...parsedInput.values].sort((a, b) => a - b);
    } else {
      const parsedExpected = parseCustomArrayInput(customExpected);
      if (parsedExpected.error || !parsedExpected.values) {
        setCustomError(`Expected output: ${parsedExpected.error}`);
        setCustomResult(null);
        return;
      }
      expected = parsedExpected.values;
    }

    setCustomError(null);
    const actual = computeSortedResult(algorithm, parsedInput.values);
    setCustomResult({ actual, pass: arraysEqual(actual, expected) });
  }

  function handleCustomVisualize() {
    const parsed = parseCustomArrayInput(customInput);
    if (parsed.error || !parsed.values) {
      setCustomError(parsed.error);
      return;
    }
    onVisualize(parsed.values);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <FlaskConical className="size-3.5" />
        Test Case Panel
      </div>

      <div className="flex flex-col gap-2">
        {SORTING_TEST_CASES.map((testCase) => {
          const result = results[testCase.id];
          return (
            <div
              key={testCase.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-surface p-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{testCase.label}</span>
                  {result &&
                    (result.pass ? (
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{ color: 'var(--color-viz-sorted)' }}
                      >
                        <CheckCircle2 className="size-3.5" /> Pass
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{ color: 'var(--color-viz-swap)' }}
                      >
                        <XCircle className="size-3.5" /> Fail
                      </span>
                    ))}
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Input: [{testCase.input.join(', ')}] &nbsp;→&nbsp; Expected: [
                  {testCase.expected.join(', ')}]
                </span>
                {result && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Actual: [{result.actual.join(', ')}]
                  </span>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => runCase(testCase.id, testCase.input, testCase.expected)}
                >
                  <Play className="size-3.5" />
                  Run
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onVisualize(testCase.input)}
                >
                  Visualize
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Wand2 className="size-3.5" />
          Custom case
        </span>
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <Input
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              if (customError) setCustomError(null);
            }}
            placeholder="Input: 3,1,2"
            aria-label="Custom test case input"
            className={cn(
              'text-xs',
              customError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          <Input
            value={customExpected}
            onChange={(e) => setCustomExpected(e.target.value)}
            placeholder="Expected (optional): 1,2,3"
            aria-label="Custom test case expected output"
            className="text-xs"
          />
        </div>
        {customError && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {customError}
          </p>
        )}
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={runCustomCase}>
            <Play className="size-3.5" />
            Run
          </Button>
          <Button size="sm" className="h-7 px-2 text-xs" onClick={handleCustomVisualize}>
            Visualize
          </Button>
          {customResult && (
            <span
              className="flex items-center gap-1 font-mono text-xs font-medium"
              style={{
                color: customResult.pass ? 'var(--color-viz-sorted)' : 'var(--color-viz-swap)',
              }}
            >
              {customResult.pass ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              {customResult.pass ? 'Pass' : 'Fail'} — Actual: [{customResult.actual.join(', ')}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
