import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Applies the current theme as a class on <html> whenever it
 * changes. Mounted once at the app root (see App.tsx). Kept as a
 * side-effect hook rather than inline in main.tsx so theme logic
 * has a single, testable home.
 */
export function useTheme() {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return theme;
}
