import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { router } from '@/router/routes';
import { useTheme } from '@/hooks/useTheme';

export function App() {
  // Keeps <html class="dark"> in sync with the settings store after
  // mount. The inline script in index.html handles the pre-mount
  // state to avoid a flash; this hook takes over for any changes
  // that happen during the session (e.g. toggling the theme).
  useTheme();

  return (
    // reducedMotion="user" makes every Framer Motion animation in
    // the app automatically respect the OS-level prefers-reduced-motion
    // setting. This matters specifically because the CSS-level rule in
    // globals.css (forcing near-zero transition/animation durations)
    // only covers CSS transitions/animations — it has no effect on
    // Motion's JS-driven spring/tween animations (e.g. ArrayCanvas's
    // swap/layout animations), so without this, reduced-motion users
    // would still see every algorithm step animate at full speed.
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}
