# Visual Algorithm Explorer

An interactive, in-browser playground for understanding data structures and algorithms through step-by-step visualizations — built as a portfolio-quality demonstration of frontend architecture, not just a single feature.

## Status: Phase 2 — Algorithm Engine Core

Phase 1 (foundation, routing, layout, theme) is complete. Phase 2 adds the algorithm engine itself: one real algorithm (bubble sort), wired end-to-end through a generic, framework-agnostic playback engine, an adapter that translates algorithm steps into a renderable scene, and a minimal (deliberately unanimated — that's Phase 3) array canvas with real play/pause/step/reset/speed/randomize controls.

Visit `/algorithm/sorting/bubble-sort` to see it running. No other algorithms or visualization types exist yet — that's Phases 4, 6, and 7.

## Tech stack

- React 19 + TypeScript (strict mode, no `any`)
- Vite 7
- Tailwind CSS v4 (CSS-first config, `@tailwindcss/vite`)
- React Router v7 (lazy-loaded routes)
- Framer Motion
- Zustand (persisted theme + favorites stores)
- Radix UI primitives (Dialog) + a hand-built shadcn/ui-style component layer
- Lucide React icons

## Getting started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # typecheck (tsc -b) + production build
npm run lint       # ESLint
npm run format     # Prettier --write
npm run typecheck  # tsc -b --noEmit only
```

## Architecture summary

The core principle: **algorithms are plugins, not features.** Layers depend only downward:

```
Pages → Feature Components → Visualization Engine → Algorithm Engine → Algorithm Implementations
```

`src/algorithms/` contains pure TypeScript with zero React or UI imports — algorithms are generator functions that yield step objects, decoupled entirely from how those steps get rendered or animated. `bubbleSort.ts` is the reference implementation; see inline comments there and in `src/engine/AlgorithmEngine.ts` for where that boundary lives and why steps are cached eagerly rather than pulled lazily.

### Folder structure

| Folder                      | Purpose                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `algorithms/`               | Pure algorithm logic. No UI imports allowed. `sorting/bubbleSort.ts` is the only real algorithm so far; `registry.ts` is the id-keyed lookup.             |
| `engine/`                   | `AlgorithmEngine.ts` (framework-agnostic playback class), `useAlgorithmEngine.ts` (React binding via `useSyncExternalStore`), `adapters/arrayAdapter.ts`. |
| `animations/`               | Framer Motion variants and timing presets (Phase 3+ — `ArrayCanvas` is currently unanimated by design).                                                   |
| `components/ui/`            | Base design-system primitives (Button, Card, Badge, Input...).                                                                                            |
| `components/layout/`        | Navbar, Sidebar, Footer, MobileDrawer.                                                                                                                    |
| `components/common/`        | Cross-page reusable pieces (SearchBar, PageContainer, EmptyState...).                                                                                     |
| `components/visualization/` | `ArrayCanvas` — pure renderer, no algorithm awareness. Graph/tree canvases land in Phases 6/7.                                                            |
| `components/controls/`      | `ControlPanel`, `SpeedSlider` — fully generic playback UI.                                                                                                |
| `components/panels/`        | `StatsPanel` (step counter; comparison/swap counts land later).                                                                                           |
| `pages/`                    | Route-level components — compose, don't implement. `AlgorithmDetailPage` is wired to the real engine.                                                     |
| `layouts/`                  | `RootLayout` — the app shell every page renders inside.                                                                                                   |
| `hooks/`                    | Cross-cutting React hooks (`useTheme`).                                                                                                                   |
| `store/`                    | Zustand stores for genuinely global, persisted state.                                                                                                     |
| `types/`                    | Shared TypeScript types.                                                                                                                                  |
| `constants/`                | Routes, nav items, sidebar categories — single source of truth.                                                                                           |
| `router/`                   | Route definitions, all lazy-loaded.                                                                                                                       |

## Design system

Near-black/near-white neutral palette with a single amber accent (`--color-accent-*`), chosen because it's the same hue the visualization engine will use to highlight "active" elements during algorithm playback — brand color tied to product mechanics. Inter for UI text, JetBrains Mono used deliberately as a UI accent for metadata (complexity badges, step counters), not just code blocks.

Theme is implemented via CSS variables in `src/styles/globals.css`, toggled by adding/removing a `.dark` class on `<html>`, persisted via Zustand and read pre-mount by an inline script in `index.html` to avoid a flash of the wrong theme.

## Roadmap

See the full architecture and phase breakdown in the project's design documentation. Sidebar categories marked "Soon" are real, scoped work — not placeholders pretending otherwise.
