import { AnimatePresence, motion } from 'framer-motion';
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
 * The exact same component drives every sorting, searching, graph,
 * and tree algorithm without a single change here.
 *
 * Polish pass: the four transport buttons (reset/back/play/forward)
 * are grouped into one visually connected segmented cluster instead
 * of individually-spaced buttons, which reads more like a deliberate
 * control surface (the dev-tool reference points — Linear, Raycast —
 * group related actions this way) rather than a loose row of icons.
 * The play/pause icon cross-fades via AnimatePresence on toggle
 * instead of swapping instantly. Props and behavior are unchanged.
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
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          aria-label="Reset to start"
          title="Reset"
        >
          <RotateCcw className="size-4" />
        </Button>

        <div className="flex items-center overflow-hidden rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onStepBackward}
            disabled={!canStepBackward}
            aria-label="Step backward"
            title="Step backward"
            className="rounded-none border-0"
          >
            <SkipBack className="size-4" />
          </Button>

          <div className="h-5 w-px bg-border" aria-hidden="true" />

          <Button
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            disabled={isFinished && !isPlaying}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
            className="relative rounded-none border-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isPlaying ? 'pause' : 'play'}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-center"
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </Button>

          <div className="h-5 w-px bg-border" aria-hidden="true" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onStepForward}
            disabled={isFinished}
            aria-label="Step forward"
            title="Step forward"
            className="rounded-none border-0"
          >
            <SkipForward className="size-4" />
          </Button>
        </div>
      </div>

      <SpeedSlider speed={speed} onSpeedChange={onSpeedChange} />

      <Button variant="outline" size="sm" onClick={onRandomize}>
        <Shuffle className="size-4" />
        New input
      </Button>
    </div>
  );
}
