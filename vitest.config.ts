import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Deliberately a separate config file from vite.config.ts rather
 * than merging `test` options into the app's build config — keeps
 * the production build entirely untouched by test-only concerns
 * (jsdom environment, test globals), and means `npm run build`
 * never accidentally depends on anything test-related.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
