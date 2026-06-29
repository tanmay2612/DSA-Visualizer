# Visual Algorithm Explorer

An interactive, in-browser playground for understanding data structures and algorithms through step-by-step visualizations — built as a portfolio-quality demonstration of frontend architecture, not just a single feature.

## Status: Phase 6 — Graph Visualization Engine

Phases 1–5 (foundation, engine core, animation/control polish, sorting suite, searching) are complete. Phase 6 is the first new visualization type: BFS, DFS, and Dijkstra's algorithm, with a real `GraphCanvas` (SVG-based, not divs — graphs need arbitrary 2D positions and lines between points) and `graphAdapter`, alongside the existing array pipeline rather than replacing it.

What's genuinely new vs. reused:

- **A whole second step vocabulary** (`GraphAlgorithmStep`: `visit-node`, `relax-edge`, `mark-finalized`, `mark-path`, `done`) and a second scene type (`GraphSceneDescription`), added to the existing unions rather than overloading the array ones — graphs and arrays share no real structure beyond "something happened."
- **The engine, `useAlgorithmEngine`, `ControlPanel`, and `SpeedSlider` needed zero changes.** They were already generic over step/input type; graphs just needed their own adapter and canvas, exactly the separation the architecture was designed for.
- **Fixed circular layout, not force-directed simulation** — computed once at graph-generation time, deterministic, no runtime physics step. `generateRandomGraph` builds a random spanning tree first (guaranteeing connectivity) then adds a few extra edges, rather than risking a naively-random edge set leaving nodes unreachable.
- **A real, hand-implemented binary min-heap for Dijkstra** — claiming `O((V + E) log V)` complexity and then actually scanning for the minimum each iteration would have been a lie. Verified the heap's pop order against 50 random property-test trials, and verified Dijkstra's actual shortest-path output (distance and reconstructed path) against an independent O(V²) brute-force reference across 50 trials.
- **Two real design gaps caught by testing, not anticipated up front**: `relax-edge` originally only carried an edge id, leaving the adapter to guess which of the edge's two endpoints a distance update applied to — genuinely ambiguous, fixed by having the algorithm state the node id explicitly. And the start node's distance (always 0) is never communicated by any `relax-edge`, since nothing relaxes into a search's own origin — a test that checked the adapter's distance output against Dijkstra's real path cost caught the start node showing `undefined`. Fixed by having `mark-finalized` optionally carry settled distances, since finalization is the moment Dijkstra actually knows a distance for certain.

Visit `/algorithm/graphs/{bfs, dfs, dijkstra}`. No tree visualization type exists yet — that's Phase 7.

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

`src/algorithms/` contains pure TypeScript with zero React or UI imports — algorithms are generator functions that yield step objects, decoupled entirely from how those steps get rendered or animated. Eleven algorithms across three categories now share this contract, including the first to use a wholly different visualization type (`bfs`, `dfs`, `dijkstra` render through `GraphCanvas`/`graphAdapter`, not `ArrayCanvas`/`arrayAdapter`) — proving the architecture's "logic separate from rendering" boundary generalizes across visualization types, not just within one. See inline comments in `src/engine/AlgorithmEngine.ts` for why steps are cached eagerly rather than pulled lazily, and in `src/engine/adapters/arrayAdapter.ts` / `graphAdapter.ts` for how visual state is derived from step history rather than tracked as separate mutable state.

### Folder structure

| Folder                      | Purpose                                                                                                                                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `algorithms/`               | Pure algorithm logic. No UI imports allowed. `sorting/` (6), `searching/` (2), `graphs/` (3: `bfs`, `dfs`, `dijkstra`, all sharing the `Graph` data model and a per-category-but-not-per-algorithm input shape); `registry.ts` erases to `AlgorithmDefinition<unknown>` at the point all categories combine. |
| `engine/`                   | `AlgorithmEngine.ts` (framework-agnostic playback class; defensive validation on `play`/`setSpeed`; `allSteps` getter for pre-playback display), `useAlgorithmEngine.ts`, `adapters/arrayAdapter.ts`, `adapters/graphAdapter.ts`.                                                                            |
| `animations/`               | Reserved for shared Framer Motion variants/timing presets if multiple canvases need to share them (Phase 7+) — `ArrayCanvas`/`GraphCanvas` currently define their own inline.                                                                                                                                |
| `components/ui/`            | Base design-system primitives (Button, Card, Badge, Input...).                                                                                                                                                                                                                                               |
| `components/layout/`        | Navbar, Sidebar, Footer, MobileDrawer.                                                                                                                                                                                                                                                                       |
| `components/common/`        | Cross-page reusable pieces (SearchBar, PageContainer, EmptyState, `AlgorithmCard`...).                                                                                                                                                                                                                       |
| `components/visualization/` | `ArrayCanvas` (div-based bars) and `GraphCanvas` (SVG-based nodes/edges) — both pure renderers with zero algorithm awareness, only consuming their respective `SceneDescription`. Tree canvas lands in Phase 7.                                                                                              |
| `components/controls/`      | `ControlPanel`, `SpeedSlider` — fully generic playback UI, unchanged since Phase 3 despite three new visualization-affecting phases since.                                                                                                                                                                   |
| `components/panels/`        | `StatsPanel` (step counter; comparison/swap counts land later).                                                                                                                                                                                                                                              |
| `pages/`                    | Route-level components — compose, don't implement. `AlgorithmDetailPage` branches on `visualizationType` to pick array vs. graph canvas/adapter; everything else about it (engine wiring, controls, keyboard shortcuts) is visualization-type-agnostic.                                                      |
| `layouts/`                  | `RootLayout` — the app shell every page renders inside.                                                                                                                                                                                                                                                      |
| `hooks/`                    | Cross-cutting React hooks (`useTheme`, `useKeyboardShortcuts`).                                                                                                                                                                                                                                              |
| `store/`                    | Zustand stores for genuinely global, persisted state.                                                                                                                                                                                                                                                        |
| `types/`                    | Shared TypeScript types.                                                                                                                                                                                                                                                                                     |
| `constants/`                | Routes, nav items, sidebar categories — single source of truth.                                                                                                                                                                                                                                              |
| `router/`                   | Route definitions, all lazy-loaded.                                                                                                                                                                                                                                                                          |

## Design system

Near-black/near-white neutral palette with a single amber accent (`--color-accent-*`), chosen because it's the same hue the visualization engine will use to highlight "active" elements during algorithm playback — brand color tied to product mechanics. Inter for UI text, JetBrains Mono used deliberately as a UI accent for metadata (complexity badges, step counters), not just code blocks.

Theme is implemented via CSS variables in `src/styles/globals.css`, toggled by adding/removing a `.dark` class on `<html>`, persisted via Zustand and read pre-mount by an inline script in `index.html` to avoid a flash of the wrong theme.

## Roadmap

See the full architecture and phase breakdown in the project's design documentation. Sidebar categories marked "Soon" are real, scoped work — not placeholders pretending otherwise.
