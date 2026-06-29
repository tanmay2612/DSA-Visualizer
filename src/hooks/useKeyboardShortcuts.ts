import { useEffect } from 'react';

interface PlaybackShortcutHandlers {
  isPlaying: boolean;
  isFinished: boolean;
  canStepBackward: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  /** Set false to disable all shortcuts, e.g. while a dialog is open. */
  enabled?: boolean;
}

/**
 * Space = play/pause, ArrowRight = step forward, ArrowLeft = step
 * backward, R = reset. Takes the same shape of callbacks as
 * ControlPanelProps deliberately — any page that wires up a
 * ControlPanel can wire this hook with the exact same handlers,
 * rather than each page reimplementing its own key listener.
 *
 * Ignores keystrokes while focus is in a text input, textarea, or
 * any contentEditable element, so typing in (a future) search box
 * or a code-editing field doesn't accidentally trigger playback.
 */
export function useKeyboardShortcuts({
  isPlaying,
  isFinished,
  canStepBackward,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  enabled = true,
}: PlaybackShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault(); // prevent the page from scrolling
          if (isPlaying) {
            onPause();
          } else if (!isFinished) {
            onPlay();
          }
          break;
        case 'ArrowRight':
          if (!isFinished) {
            event.preventDefault();
            onStepForward();
          }
          break;
        case 'ArrowLeft':
          if (canStepBackward) {
            event.preventDefault();
            onStepBackward();
          }
          break;
        case 'KeyR':
          onReset();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    isPlaying,
    isFinished,
    canStepBackward,
    onPlay,
    onPause,
    onStepForward,
    onStepBackward,
    onReset,
  ]);
}
