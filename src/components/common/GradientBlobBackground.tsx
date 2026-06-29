import { motion } from 'framer-motion';

/**
 * Two soft, blurred gradient shapes that drift slowly behind the
 * hero content. Pure CSS (radial gradients + blur) animated via
 * Framer Motion, which is already a dependency — no new packages.
 * `aria-hidden` and `pointer-events-none` since this is purely
 * decorative; it must never intercept clicks or be announced to
 * screen readers. Inherits `reducedMotion="user"` from the
 * app-level `MotionConfig` (see App.tsx) automatically, the same as
 * every other Motion-driven animation in the app — no separate
 * reduced-motion handling needed here.
 */
export function GradientBlobBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-[10%] top-[-10%] size-[420px] rounded-full opacity-[0.15] blur-[90px] dark:opacity-[0.12]"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, var(--color-viz-compare), transparent 70%)',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[8%] top-[5%] size-[380px] rounded-full opacity-[0.13] blur-[90px] dark:opacity-[0.1]"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, var(--color-accent-500), transparent 70%)',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 25, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[35%] size-[350px] rounded-full opacity-[0.1] blur-[100px] dark:opacity-[0.08]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, var(--color-viz-sorted), transparent 70%)',
        }}
        animate={{ x: [0, 25, -25, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}
