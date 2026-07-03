https://dsa-visualizer-six-rose.vercel.app/


# Visual Algorithm Explorer

An interactive, in-browser playground for understanding data structures and algorithms through step-by-step visualizations — built as a portfolio-quality demonstration of frontend architecture, not just a single feature.

## Status: Phases 8–9 (in progress) — Learning Platform + Production Quality

Phases 1–7 complete. This round implemented three concrete, verified slices spanning Phase 8 (interactive learning) and Phase 9 (production quality):

---

**Phase 8 slice 2: Step info panel + per-step explanations (this round)**

Added `StepInfoPanel` — shows a plain-English explanation of what the algorithm is currently doing plus the key variable values at each step (`i`, `j`, `mid`, `target`, `nodeId`, `dist`, etc.), derived entirely from the step data that was _already in the step types' fields_. No algorithm files changed. Covers all three visualization domains (array, graph, tree) via one exhaustive switch, with a TypeScript exhaustiveness check confirming every step type is handled. Examples:

- `compare` → "Comparing 5 at [0] with 2 at [1]. 5 > 2, a swap is needed."
- `relax-edge` → "Edge e2 relaxed — node n3 now has a shorter known distance: 7."
- `eliminate-range` → "Eliminating positions 0–3: target cannot be in this half. Search space halved."

---

**Phase 9 slice 1: Error boundaries**

First error boundary infrastructure in the project (confirmed by grep before writing any code — zero existed through Phase 8). Two boundaries:

1. **Route-level** in `RootLayout`, keyed by pathname so a crash on one page doesn't permanently disable all subsequent navigation during the session without a reload.
2. **Inline** in `AlgorithmDetailPage`, wrapping only the canvas subtree — a crash in the adapter/canvas path falls back to a descriptive error state while the controls/breadcrumb/pseudocode stay functional.

React error boundaries require class components (no hook equivalent in React 19); the `override` modifier is enforced correctly by the strict tsconfig's `noImplicitOverride` setting, which caught this immediately on the first typecheck.

---

**Phase 9 slice 2: Real test suite — 136 tests, all passing**

Vitest configured (separate from `vite.config.ts` to keep the production build entirely untouched), 6 test files, 136 tests across:

- **`AlgorithmEngine.test.ts`** (34 tests) — full lifecycle: initialize, stepForward/stepBackward/jumpToStep/reset/play/pause/randomizeInput, including the Phase 2 `play(syntheticEvent)` bug as a regression test
- **`arrayAdapter.test.ts`** (14 tests) — the three accumulation behaviors that had real bugs during development: sorted-mark clearing on overwrite (Phase 4 merge-sort bug), eliminated-range accumulation, and `done.outcome` discrimination (Phase 5 not-found incorrectly showing "sorted")
- **`sorting.test.ts`** (42 tests) — 7 input cases × 6 algorithms, including degenerate inputs (ascending, descending, duplicates, empty, single-element)
- **`searching.test.ts`** (8 tests) — linear and binary search, including the eliminated-range coverage check for not-found runs
- **`bst.test.ts`** (15 tests) — all three structural BST delete cases (leaf, one child, two children/root), plus invariant preservation checked at every intermediate snapshot
- **`parseCustomArrayInput.test.ts`** (23 tests) — the Phase 8 custom input parser, boundary values, malformed patterns, and descriptive error messages

One real bug caught by the tests during this session: my initial tests assumed `stepForward()`/`stepBackward()` returned `true`/`false`, but the public API returns `void` (only the internal method returns boolean). Fixed the tests to verify observable effects instead. This is exactly what tests are for.

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

`src/algorithms/` contains pure TypeScript with zero React or UI imports — algorithms are generator functions that yield step objects, decoupled entirely from how those steps get rendered or animated. Fourteen algorithms across four categories now share this contract, spanning all three visualization types (`ArrayCanvas`/`arrayAdapter`, `GraphCanvas`/`graphAdapter`, `TreeCanvas`/`treeAdapter`) — including two genuinely different relationships between "data" and "step snapshot" (graphs: static structure, separate step history; trees: mutating structure, full snapshot per step, like arrays), proving the architecture's "logic separate from rendering" boundary holds across more than one structural shape, not just more than one visualization type. See inline comments in `src/engine/AlgorithmEngine.ts` for why steps are cached eagerly rather than pulled lazily, and in each adapter for how visual state is derived from step history rather than tracked as separate mutable state.

### Folder structure

| Folder                      | Purpose                                                                                                                                                                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `algorithms/`               | Pure algorithm logic. No UI imports allowed. `sorting/` (6), `searching/` (2), `graphs/` (3), `trees/` (3: `bst-insert`, `bst-delete`, `in-order-traversal`, sharing `TreeNode`/`treeHelpers.ts`); `registry.ts` erases to `AlgorithmDefinition<unknown>` at the point all categories combine. |
| `engine/`                   | `AlgorithmEngine.ts` (framework-agnostic playback class), `useAlgorithmEngine.ts`, `adapters/arrayAdapter.ts`, `adapters/graphAdapter.ts`, `adapters/treeAdapter.ts` (the latter owns tree layout — see its doc comment for why layout is recomputed fresh per call rather than cached).       |
| `animations/`               | Reserved for shared Framer Motion variants/timing presets if multiple canvases need to share them — `ArrayCanvas`/`GraphCanvas`/`TreeCanvas` currently each define their own inline.                                                                                                           |
| `components/ui/`            | Base design-system primitives (Button, Card, Badge, Input...) — `Card`/`Button` got a polish pass in Phase 7 (softer shadows, refined transitions), no API changes.                                                                                                                            |
| `components/layout/`        | Navbar, Sidebar, Footer, MobileDrawer.                                                                                                                                                                                                                                                         |
| `components/common/`        | Cross-page reusable pieces (SearchBar, PageContainer, EmptyState, `AlgorithmCard`, `GradientBlobBackground`...).                                                                                                                                                                               |
| `components/visualization/` | `ArrayCanvas` (div-based bars), `GraphCanvas` (SVG, fixed circular layout), `TreeCanvas` (SVG, layout recomputed per snapshot, node position animated via Framer Motion) — all pure renderers with zero algorithm awareness.                                                                   |
| `components/controls/`      | `ControlPanel` (segmented button cluster as of Phase 7's polish pass), `SpeedSlider` — fully generic playback UI.                                                                                                                                                                              |
| `components/panels/`        | `StatsPanel` — upgraded in Phase 7 to a stat-card grid (comparisons/mutations/elapsed/speed/status), all derived from data the page already had or tracked component-locally; no engine changes.                                                                                               |
| `pages/`                    | Route-level components — compose, don't implement. `AlgorithmDetailPage` branches on `visualizationType` (array/graph/tree) to pick the right canvas/adapter pair; everything else about it is visualization-type-agnostic.                                                                    |
| `layouts/`                  | `RootLayout` — the app shell every page renders inside.                                                                                                                                                                                                                                        |
| `hooks/`                    | Cross-cutting React hooks (`useTheme`, `useKeyboardShortcuts`).                                                                                                                                                                                                                                |
| `store/`                    | Zustand stores for genuinely global, persisted state.                                                                                                                                                                                                                                          |
| `types/`                    | Shared TypeScript types.                                                                                                                                                                                                                                                                       |
| `constants/`                | Routes, nav items, sidebar categories — single source of truth.                                                                                                                                                                                                                                |
| `router/`                   | Route definitions, all lazy-loaded.                                                                                                                                                                                                                                                            |

## Design system

Near-black/near-white neutral palette with a single amber accent (`--color-accent-*`), chosen because it's the same hue the visualization engine will use to highlight "active" elements during algorithm playback — brand color tied to product mechanics. Inter for UI text, JetBrains Mono used deliberately as a UI accent for metadata (complexity badges, step counters), not just code blocks.

Theme is implemented via CSS variables in `src/styles/globals.css`, toggled by adding/removing a `.dark` class on `<html>`, persisted via Zustand and read pre-mount by an inline script in `index.html` to avoid a flash of the wrong theme.

## Roadmap

See the full architecture and phase breakdown in the project's design documentation. Sidebar categories marked "Soon" are real, scoped work — not placeholders pretending otherwise.
