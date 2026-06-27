import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/routes';
import { useTheme } from '@/hooks/useTheme';

export function App() {
  // Keeps <html class="dark"> in sync with the settings store after
  // mount. The inline script in index.html handles the pre-mount
  // state to avoid a flash; this hook takes over for any changes
  // that happen during the session (e.g. toggling the theme).
  useTheme();

  return <RouterProvider router={router} />;
}
