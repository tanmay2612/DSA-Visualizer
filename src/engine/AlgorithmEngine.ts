import type { AlgorithmDefinition, AlgorithmStep } from '@/algorithms/shared/types';

export interface EngineProgress {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isFinished: boolean;
}

type Listener = () => void;

/**
 * Orchestrates one running algorithm: owns the cached step array,
 * the current position in it, and the play/pause timer. This is
 * the class referenced in the architecture doc's §4 — notice it
 * does NOT live inside an algorithm file. Every algorithm
 * (sorting, searching, graph, tree alike) is driven by one shared
 * instance of this class, which is the entire point of separating
 * "what the algorithm does" (the generator) from "how playback
 * works" (this class).
 *
 * Steps are drained eagerly on `initialize()` rather than pulled
 * lazily during playback. At this app's input sizes (a handful to
 * a few hundred elements), eagerly materializing the full step
 * array costs nothing meaningful and buys trivial reverse playback
 * and scrubbing — `previousStep()` and `jumpToStep()` are just
 * array index changes, not re-derivations. See the architecture
 * doc §1.2 for the fuller trade-off discussion.
 *
 * Framework-agnostic on purpose: no React import here. The
 * `useAlgorithmEngine` hook (engine/useAlgorithmEngine.ts) is the
 * only place this class touches React, via a thin subscription
 * adapter — which also makes this class trivially unit-testable
 * without rendering anything.
 */
export class AlgorithmEngine<TInput = number[]> {
  private steps: AlgorithmStep[] = [];
  private currentIndex = -1; // -1 = before the first step (initial input state)
  private initialInput: TInput | null = null;
  private playing = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private speed = 1;
  private listeners = new Set<Listener>();
  private version = 0; // incremented on every notify(), used by useSyncExternalStore

  private definition: AlgorithmDefinition<TInput> | null;

  constructor(definition: AlgorithmDefinition<TInput> | null = null) {
    this.definition = definition;
  }

  /** Base delay in ms between steps at 1x speed. */
  private static readonly BASE_DELAY_MS = 500;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }

  /** Monotonically increasing counter, incremented on every state
   *  change. Used by `useAlgorithmEngine`'s `useSyncExternalStore`
   *  snapshot to give React a value that actually differs between
   *  renders — returning the engine object itself was a bug: since
   *  `Object.is(engine, engine)` is always true, React would bail
   *  out of re-rendering even after state changed. */
  get stateVersion(): number {
    return this.version;
  }

  /**
   * Loads a new algorithm + input and drains its generator
   * immediately into `this.steps`. Any in-flight playback timer
   * from a previous run is cleared first so switching algorithms
   * mid-playback can't leave a stray interval running.
   */
  initialize(definition: AlgorithmDefinition<TInput>, input: TInput): void {
    this.pause();
    this.definition = definition;
    this.initialInput = input;
    this.steps = [...definition.run(input)];
    this.currentIndex = -1;
    this.notify();
  }

  play(speed = this.speed): void {
    if (!this.definition || this.isFinished || this.playing) return;
    // Defensive: a non-finite or non-positive speed (e.g. accidentally
    // passing a DOM event into this parameter at a call site) would
    // make scheduleNextTick's BASE_DELAY_MS / speed divide-by-garbage,
    // producing NaN — and setInterval(fn, NaN) fires essentially
    // immediately on every tick, blowing through all remaining steps
    // in a single render frame instead of animating. Falling back to
    // the last known-good speed keeps a caller bug from corrupting
    // playback instead of just rejecting it silently.
    this.speed = Number.isFinite(speed) && speed > 0 ? speed : this.speed;
    this.playing = true;
    this.notify();
    this.scheduleNextTick();
  }

  pause(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.playing) {
      this.playing = false;
      this.notify();
    }
  }

  private scheduleNextTick(): void {
    const delay = AlgorithmEngine.BASE_DELAY_MS / this.speed;
    this.timerId = setInterval(() => {
      const advanced = this.stepForwardInternal();
      if (!advanced || this.isFinished) {
        this.pause();
      }
    }, delay);
  }

  setSpeed(speed: number): void {
    if (!Number.isFinite(speed) || speed <= 0) return;
    this.speed = speed;
    // If currently playing, restart the timer at the new interval
    // rather than waiting for the next tick to pick it up.
    if (this.playing) {
      this.pause();
      this.play(speed);
    }
  }

  /** Advances one step. Returns false if already at the last step. */
  private stepForwardInternal(): boolean {
    if (this.currentIndex >= this.steps.length - 1) return false;
    this.currentIndex += 1;
    this.notify();
    return true;
  }

  /** Public step-forward — pauses any active playback first, since
   *  manual stepping while auto-playing would race the timer. */
  stepForward(): void {
    this.pause();
    this.stepForwardInternal();
  }

  stepBackward(): void {
    this.pause();
    if (this.currentIndex <= -1) return;
    this.currentIndex -= 1;
    this.notify();
  }

  jumpToStep(index: number): void {
    this.pause();
    this.currentIndex = Math.max(-1, Math.min(index, this.steps.length - 1));
    this.notify();
  }

  reset(): void {
    this.pause();
    this.currentIndex = -1;
    this.notify();
  }

  /** Reruns the current algorithm with a freshly generated random input. */
  randomizeInput(size: number): void {
    if (!this.definition) return;
    const input = this.definition.generateRandomInput(size);
    this.initialize(this.definition, input);
  }

  get currentStep(): AlgorithmStep | null {
    return this.currentIndex >= 0 ? this.steps[this.currentIndex] : null;
  }

  /**
   * All steps from the start up to and including the current
   * position. Adapters that need to accumulate state across steps
   * (e.g. arrayAdapter's "sorted" markers, which persist once set
   * rather than being re-stated every step) use this instead of
   * `currentStep` alone. Returns a fresh slice, safe to use directly
   * without risk of mutating engine-internal state.
   */
  get stepsUpToCurrent(): AlgorithmStep[] {
    return this.currentIndex >= 0 ? this.steps.slice(0, this.currentIndex + 1) : [];
  }

  /**
   * Every step from this run, regardless of playback position.
   * Exists for arrayAdapter's pre-playback fallback: when
   * `stepsUpToCurrent` is empty (currentIndex === -1, before the
   * user has pressed play or stepped forward), the adapter still
   * needs `steps[0]`'s array (ids+values) to render the algorithm's
   * untouched initial state — see arrayAdapter's doc comment. A
   * fresh slice, like `stepsUpToCurrent`, so callers can't mutate
   * engine-internal state through it.
   */
  get allSteps(): AlgorithmStep[] {
    return this.steps.slice();
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get isFinished(): boolean {
    return this.currentIndex >= this.steps.length - 1;
  }

  get progress(): EngineProgress {
    return {
      currentIndex: this.currentIndex,
      totalSteps: this.steps.length,
      isPlaying: this.playing,
      isFinished: this.isFinished,
    };
  }

  get input(): TInput | null {
    return this.initialInput;
  }

  get speedMultiplier(): number {
    return this.speed;
  }
}
