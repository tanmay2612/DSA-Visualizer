import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui';
import { SpeedSlider } from './SpeedSlider';

export interface ControlPanelProps {
  isPlaying: boolean;
  isFinished: boolean;
  canStepBackward: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onRandomize: () => void;
}

/**
 * Fully generic playback control bar. Per the architecture doc §3,
 * this component never imports anything from `algorithms/` — it
 * only knows "isPlaying", "canStepBackward", etc., never *why*.
 * The exact same component drives bubble sort today and will drive
 * Dijkstra's algorithm in Phase 6 without a single change here.
 */
export function ControlPanel({
  isPlaying,
  isFinished,
  canStepBackward,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onRandomize,
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          aria-label="Reset to start"
          title="Reset"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onStepBackward}
          disabled={!canStepBackward}
          aria-label="Step backward"
          title="Step backward"
        >
          <SkipBack className="size-4" />
        </Button>

        <Button
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          disabled={isFinished && !isPlaying}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onStepForward}
          disabled={isFinished}
          aria-label="Step forward"
          title="Step forward"
        >
          <SkipForward className="size-4" />
        </Button>
      </div>

      <SpeedSlider speed={speed} onSpeedChange={onSpeedChange} />

      <Button variant="outline" size="sm" onClick={onRandomize}>
        <Shuffle className="size-4" />
        New input
      </Button>
    </div>
  );
}
