import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';
import { THEME_STORAGE_KEY } from '@/constants/theme';

interface SettingsState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

function getSystemPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Global settings store. Phase 1 only manages theme, but this is
 * where future cross-route preferences (playback speed default,
 * sound on/off) belong per the architecture's state management plan —
 * anything global and persisted goes here, not in component state.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: getSystemPreference(),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: THEME_STORAGE_KEY,
    },
  ),
);
