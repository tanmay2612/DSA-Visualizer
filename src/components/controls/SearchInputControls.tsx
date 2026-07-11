import { useState } from 'react';
import { AlertCircle, Target } from 'lucide-react';
import { parseCustomArrayInput } from '@/algorithms/shared/parseCustomArrayInput';
import type { SearchInput } from '@/algorithms/searching/linearSearch';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

interface SearchInputControlsProps {
  /** Binary search requires a sorted array to be correct — unlike
   *  ArrayInputControls' variant buttons (which are fine to skip
   *  here; see this component's top doc comment), a user-typed
   *  custom array has no such guarantee, so it needs to be sorted
   *  before being handed to the algorithm rather than silently
   *  producing wrong eliminate-range behavior. */
  requiresSortedArray: boolean;
  onApply: (value: SearchInput) => void;
}

/**
 * Bug fix (post-Phase 10 QA): linearSearch and binarySearch are the
 * *only* two algorithms in the project whose input is
 * visualizationType 'array' but NOT a plain `number[]` — they need
 * `{ values, target }` (see SearchInput in linearSearch.ts). Before
 * this component existed, AlgorithmDetailPage rendered the generic
 * ArrayInputControls for them anyway (it renders for any
 * `visualizationType === 'array'` algorithm), which only ever
 * produces a bare `number[]`. Applying custom input or clicking any
 * "input shape" button on either search page fed that bare array
 * straight into `initialize()`, so the algorithm's `{ values,
 * target }` destructuring got `undefined`/garbage — binarySearch
 * threw immediately (`values.map is not a function`, since
 * `input.values` was `undefined` there), and linearSearch threw the
 * same way. Both were reproducible with a one-line unit test.
 *
 * This component is search-specific rather than a generalization of
 * ArrayInputControls because search's variant buttons (nearly
 * sorted / reverse sorted / duplicate heavy) don't transfer
 * cleanly: binary search requires its array sorted to be correct,
 * so "reverse sorted" would silently produce a broken run rather
 * than just an unusual one. The existing Randomize button (wired to
 * `algorithm.generateRandomInput`, unaffected by this bug) already
 * covers "give me a valid random case" correctly for both
 * algorithms — this component only needs to cover "let me type my
 * own array and target," which is the one thing Randomize can't do.
 */
export function SearchInputControls({ requiresSortedArray, onApply }: SearchInputControlsProps) {
  const [arrayText, setArrayText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const parsedArray = parseCustomArrayInput(arrayText);
    if (parsedArray.error || !parsedArray.values) {
      setError(parsedArray.error);
      return;
    }

    const trimmedTarget = targetText.trim();
    const target = Number(trimmedTarget);
    if (trimmedTarget.length === 0 || Number.isNaN(target)) {
      setError('Enter a numeric target to search for.');
      return;
    }

    setError(null);
    const values = requiresSortedArray
      ? [...parsedArray.values].sort((a, b) => a - b)
      : parsedArray.values;
    onApply({ values, target });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') handleSubmit();
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Target className="size-3.5" />
        Custom array &amp; target
      </span>
      <div className="flex flex-col gap-1.5 sm:flex-row">
        <Input
          value={arrayText}
          onChange={(e) => {
            setArrayText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Array: 5,2,8,1,9,4"
          aria-label="Custom array input"
          aria-invalid={error !== null}
          className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        />
        <Input
          value={targetText}
          onChange={(e) => {
            setTargetText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Target: 8"
          aria-label="Custom target input"
          aria-invalid={error !== null}
          className={cn('sm:w-32', error && 'border-destructive focus-visible:ring-destructive')}
        />
        <Button size="sm" onClick={handleSubmit} className="shrink-0">
          Use this
        </Button>
      </div>
      {requiresSortedArray && (
        <p className="text-xs text-muted-foreground">
          Binary search requires a sorted array — yours will be sorted automatically before
          running.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
