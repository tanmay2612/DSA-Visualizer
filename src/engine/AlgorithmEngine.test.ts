import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AlgorithmEngine } from '@/engine/AlgorithmEngine';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';

describe('AlgorithmEngine', () => {
  let engine: AlgorithmEngine<number[]>;

  beforeEach(() => {
    engine = new AlgorithmEngine<number[]>();
    engine.initialize(bubbleSort, [5, 2, 8, 1]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialize', () => {
    it('starts at currentIndex -1', () => {
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('eagerly drains the generator into steps', () => {
      expect(engine.progress.totalSteps).toBeGreaterThan(0);
    });

    it('is not finished before any steps', () => {
      expect(engine.isFinished).toBe(false);
    });

    it('is not playing after initialize', () => {
      expect(engine.isPlaying).toBe(false);
    });

    it('exposes allSteps immediately', () => {
      expect(engine.allSteps.length).toBeGreaterThan(0);
    });

    it('currentStep is null before any step', () => {
      expect(engine.currentStep).toBeNull();
    });
  });

  describe('stepForward', () => {
    it('advances currentIndex to 0', () => {
      engine.stepForward();
      expect(engine.progress.currentIndex).toBe(0);
    });

    it('advances currentIndex from -1 to 0 on first step', () => {
      expect(engine.progress.currentIndex).toBe(-1);
      engine.stepForward();
      expect(engine.progress.currentIndex).toBe(0);
    });

    it('does not advance past the last step', () => {
      const total = engine.progress.totalSteps;
      for (let i = 0; i < total; i++) engine.stepForward();
      engine.stepForward(); // call beyond end
      expect(engine.progress.currentIndex).toBe(total - 1);
    });

    it('does not advance past the last step', () => {
      const total = engine.progress.totalSteps;
      for (let i = 0; i < total; i++) engine.stepForward();
      engine.stepForward();
      expect(engine.progress.currentIndex).toBe(total - 1);
    });

    it('sets isFinished at the last step', () => {
      const total = engine.progress.totalSteps;
      for (let i = 0; i < total; i++) engine.stepForward();
      expect(engine.isFinished).toBe(true);
    });

    it('sets currentStep after stepping', () => {
      engine.stepForward();
      expect(engine.currentStep).not.toBeNull();
      expect(engine.currentStep?.type).toBeDefined();
    });

    it('stepsUpToCurrent grows by 1 per stepForward', () => {
      expect(engine.stepsUpToCurrent).toHaveLength(0);
      engine.stepForward();
      expect(engine.stepsUpToCurrent).toHaveLength(1);
      engine.stepForward();
      expect(engine.stepsUpToCurrent).toHaveLength(2);
    });
  });

  describe('stepBackward', () => {
    it('decrements currentIndex', () => {
      engine.stepForward();
      engine.stepForward();
      engine.stepBackward();
      expect(engine.progress.currentIndex).toBe(0);
    });

    it('does not go below -1 when called at the start', () => {
      engine.stepBackward();
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('does not go below -1', () => {
      engine.stepBackward();
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('clears isFinished when stepping backward from the end', () => {
      const total = engine.progress.totalSteps;
      for (let i = 0; i < total; i++) engine.stepForward();
      expect(engine.isFinished).toBe(true);
      engine.stepBackward();
      expect(engine.isFinished).toBe(false);
    });
  });

  describe('jumpToStep', () => {
    it('jumps to a specific index', () => {
      engine.jumpToStep(3);
      expect(engine.progress.currentIndex).toBe(3);
    });

    it('pauses playback on jump', () => {
      vi.useFakeTimers();
      engine.play();
      engine.jumpToStep(3);
      expect(engine.isPlaying).toBe(false);
    });

    it('clamps at -1 for negative index', () => {
      engine.jumpToStep(-99);
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('clamps at last step for out-of-bounds positive index', () => {
      engine.jumpToStep(999999);
      expect(engine.progress.currentIndex).toBe(engine.progress.totalSteps - 1);
    });

    it('sets isFinished when jumping to the last step', () => {
      engine.jumpToStep(engine.progress.totalSteps - 1);
      expect(engine.isFinished).toBe(true);
    });

    it('clears isFinished when jumping before the last step', () => {
      engine.jumpToStep(engine.progress.totalSteps - 1);
      engine.jumpToStep(0);
      expect(engine.isFinished).toBe(false);
    });
  });

  describe('reset', () => {
    it('sets currentIndex back to -1', () => {
      engine.stepForward();
      engine.reset();
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('clears isFinished', () => {
      const total = engine.progress.totalSteps;
      for (let i = 0; i < total; i++) engine.stepForward();
      engine.reset();
      expect(engine.isFinished).toBe(false);
    });

    it('preserves totalSteps (steps are not re-derived)', () => {
      const totalBefore = engine.progress.totalSteps;
      engine.stepForward();
      engine.reset();
      expect(engine.progress.totalSteps).toBe(totalBefore);
    });

    it('preserves allSteps after reset', () => {
      const stepsBefore = engine.allSteps.length;
      engine.reset();
      expect(engine.allSteps).toHaveLength(stepsBefore);
    });
  });

  describe('play / pause', () => {
    it('sets isPlaying to true', () => {
      vi.useFakeTimers();
      engine.play();
      expect(engine.isPlaying).toBe(true);
    });

    it('sets isPlaying to false after pause', () => {
      vi.useFakeTimers();
      engine.play();
      engine.pause();
      expect(engine.isPlaying).toBe(false);
    });

    it('does not throw when called with undefined (Phase 2 bug guard)', () => {
      vi.useFakeTimers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => engine.play(undefined as any)).not.toThrow();
    });

    it('advances steps during playback', () => {
      vi.useFakeTimers();
      engine.play(4);
      vi.advanceTimersByTime(2000);
      expect(engine.progress.currentIndex).toBeGreaterThan(0);
    });

    it('stops automatically at the last step', () => {
      vi.useFakeTimers();
      engine.play(4);
      vi.advanceTimersByTime(60000);
      expect(engine.isFinished).toBe(true);
      expect(engine.isPlaying).toBe(false);
    });
  });

  describe('randomizeInput', () => {
    it('resets currentIndex to -1', () => {
      engine.stepForward();
      engine.randomizeInput(8);
      expect(engine.progress.currentIndex).toBe(-1);
    });

    it('generates new steps', () => {
      engine.randomizeInput(8);
      expect(engine.progress.totalSteps).toBeGreaterThan(0);
    });
  });
  describe('stateVersion (useSyncExternalStore snapshot fix)', () => {
    it('increments on initialize', () => {
      const v0 = engine.stateVersion;
      engine.initialize(bubbleSort, [3, 1, 2]);
      expect(engine.stateVersion).toBeGreaterThan(v0);
    });

    it('increments on stepForward', () => {
      const v0 = engine.stateVersion;
      engine.stepForward();
      expect(engine.stateVersion).toBeGreaterThan(v0);
    });

    it('increments on reset', () => {
      engine.stepForward();
      const v0 = engine.stateVersion;
      engine.reset();
      expect(engine.stateVersion).toBeGreaterThan(v0);
    });

    it('increments on play', () => {
      vi.useFakeTimers();
      const v0 = engine.stateVersion;
      engine.play();
      expect(engine.stateVersion).toBeGreaterThan(v0);
    });

    it('produces a unique version per notify call', () => {
      const versions: number[] = [engine.stateVersion];
      engine.stepForward();
      versions.push(engine.stateVersion);
      engine.stepForward();
      versions.push(engine.stateVersion);
      engine.reset();
      versions.push(engine.stateVersion);
      expect(new Set(versions).size).toBe(versions.length);
    });
  });
});
