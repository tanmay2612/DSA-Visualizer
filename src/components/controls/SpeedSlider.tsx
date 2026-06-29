import { Gauge } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SpeedSliderProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

/** Discrete speed steps rather than a continuous range — matches the
 *  architecture doc's "0.5x, 1x, 2x, 4x" multiplier model exactly,
 *  and discrete steps are easier to reason about than an arbitrary
 *  continuous value when the engine's BASE_DELAY_MS / speed math is
 *  the thing actually consuming this number. */
const SPEED_STEPS = [0.5, 1, 2, 4] as const;

export function SpeedSlider({ speed, onSpeedChange, className }: SpeedSliderProps) {
  const currentStepIndex = SPEED_STEPS.indexOf(speed as (typeof SPEED_STEPS)[number]);
  const safeIndex = currentStepIndex === -1 ? 1 : currentStepIndex; // default to 1x if unset

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Gauge className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="range"
        min={0}
        max={SPEED_STEPS.length - 1}
        step={1}
        value={safeIndex}
        onChange={(event) => onSpeedChange(SPEED_STEPS[Number(event.target.value)])}
        className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-border-strong accent-accent sm:w-28"
        aria-label="Playback speed"
        aria-valuetext={`${speed}x speed`}
      />
      <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">{speed}x</span>
    </div>
  );
}
