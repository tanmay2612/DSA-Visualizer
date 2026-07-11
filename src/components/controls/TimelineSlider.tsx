import { Milestone } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TimelineSliderProps {
  /** -1 = before the first step (engine's initial position). */
  currentIndex: number;
  totalSteps: number;
  onJumpToStep: (index: number) => void;
  className?: string;
}

/**
 * Execution Timeline (Phase 10). A thin UI layer over a capability
 * the engine already had — `jumpToStep` has existed since Phase 8
 * for the "jump to end" control, so this needed zero engine changes,
 * exactly per the phase brief's "inspect whether jumpToStep already
 * exists, reuse it" instruction.
 *
 * The slider's own range is 0..totalSteps (inclusive) rather than
 * 0..totalSteps-1, because currentIndex can be -1 (no step taken
 * yet) through totalSteps-1 (last step) — mapping that onto a
 * slider means shifting by one: sliderValue = currentIndex + 1,
 * jumpToStep(sliderValue - 1). Kept local to this component so
 * nothing outside it needs to know about the offset.
 */
export function TimelineSlider({
  currentIndex,
  totalSteps,
  onJumpToStep,
  className,
}: TimelineSliderProps) {
  const sliderValue = currentIndex + 1;
  const sliderMax = totalSteps;
  const displayStep = Math.max(currentIndex + 1, 0);

  if (totalSteps === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card p-3',
        className,
      )}
    >
      <Milestone className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
        Step {displayStep} / {totalSteps}
      </span>
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={1}
        value={sliderValue}
        onChange={(event) => onJumpToStep(Number(event.target.value) - 1)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border-strong accent-accent"
        aria-label="Execution timeline"
        aria-valuetext={`Step ${displayStep} of ${totalSteps}`}
      />
    </div>
  );
}
