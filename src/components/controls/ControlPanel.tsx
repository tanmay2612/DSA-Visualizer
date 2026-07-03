import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
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
  /** Jumps directly to the final step without playing through every
   *  step in between — distinct from `onReset` (jump to the start)
   *  and from holding "step forward," which would still take O(n)
   *  clicks. Optional so existing call sites that haven't wired up
   *  a jump-to-end handler don't break — the button simply doesn't
   *  render without it, rather than crashing on a missing prop. */
  onJumpToEnd?: () => void;
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
 * `onReset` already IS "jump to beginning" (AlgorithmEngine.reset()
 * sets currentIndex back to -1) — no separate button needed for
 * that. `onJumpToEnd` is the one genuinely new transport action
 * (Phase 8), using the engine's existing `jumpToStep`, which was
 * already exposed through useAlgorithmEngine before this feature
 * needed it — no engine changes required.
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
  onJumpToEnd,
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
          aria-label="Jump to beginning"
          title="Jump to beginning"
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

        {onJumpToEnd && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onJumpToEnd}
            disabled={isFinished}
            aria-label="Jump to end"
            title="Jump to end"
          >
            <ChevronsRight className="size-4" />
          </Button>
        )}
      </div>

      <SpeedSlider speed={speed} onSpeedChange={onSpeedChange} />

      <Button variant="outline" size="sm" onClick={onRandomize}>
        <Shuffle className="size-4" />
        New input
      </Button>
    </div>
  );
}
