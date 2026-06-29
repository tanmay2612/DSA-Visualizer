/**
 * Per the architecture doc (§6), playback state (current step,
 * play/pause, speed) is intentionally NOT global Zustand state —
 * it lives in the `useAlgorithmEngine` hook, scoped per visualization
 * instance, so /compare can run two independent visualizations
 * without namespacing global state by instance ID.
 *
 * This file is a deliberate placeholder to reserve the slot in
 * store/ and document that decision. It will likely stay empty,
 * or hold only cross-instance preferences like default playback
 * speed, introduced in Phase 2/3.
 */
export {};
