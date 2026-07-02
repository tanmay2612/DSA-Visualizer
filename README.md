https://dsa-visualizer-six-rose.vercel.app/


# Visual Algorithm Explorer

An interactive, in-browser playground for understanding data structures and algorithms through step-by-step visualizations — built as a portfolio-quality demonstration of frontend architecture, not just a single feature.

## Status: Phase 7 — Tree Visualization Engine + UI Polish

Phases 1–6 (foundation, engine core, animation/control polish, sorting suite, searching, graphs) are complete. Phase 7 adds the third and final visualization type — `bst-insert`, `bst-delete`, `in-order-traversal` — plus an incremental UI polish pass across the whole app, kept deliberately separate from and secondary to the tree implementation itself.

**Trees are structurally closer to arrays than to graphs.** A graph's structure never changes during BFS/DFS/Dijkstra, only its visual state does (Phase 6); a BST's structure genuinely changes with every insert, delete, and rotation. So `TreeAlgorithmStep` follows arrays' "every step carries a full snapshot" pattern (`root: TreeNode | null`) rather than graphs' "static structure, separate step history" pattern — a deliberate architectural choice, not an oversight, made explicit in the type's doc comment so the reasoning doesn't have to be re-derived later.

- **Layout is the adapter's job, computed fresh every call** (in-order rank for x, depth for y) — unlike a graph's one-time circular layout, there's no stable layout to cache between two different tree shapes.
- **`TreeCanvas` animates node position via Framer Motion's `animate={{x, y}}`**, keyed by each node's stable id (assigned once at creation, never reassigned — see `treeHelpers.ts`), so a restructuring insert/delete animates as nodes sliding to new positions rather than popping to new locations.
- **BST delete was the highest-risk algorithm in the project so far** — three structurally different cases (leaf, one child, two children via in-order successor), each capable of silently breaking the BST invariant. Verified with 40 test cases: every structural case by hand, plus 30 randomized trials checking BST-validity, correct value set, and correct node count after every single deletion.
- **The engine, `useAlgorithmEngine`, `ControlPanel`, and registry needed no changes beyond the established add-a-category pattern** — confirming for the third time that the architecture's "logic separate from rendering" boundary holds across a genuinely different problem shape (mutating structure vs. static structure vs. mutating array).

**UI polish pass** (incremental, additive, zero architecture changes): refined `Card`/`Button` shadow and transition treatment, a real stat-card `StatsPanel` (comparisons/mutations counted generically from step-type names — no engine changes — plus a component-local elapsed-time tracker, not engine-tracked), a segmented `ControlPanel` button cluster with an animated play/pause icon swap, animated gradient-blob hero background, corrected stale homepage copy (it previously implied zero categories were live), and helpful CTAs added to the `Compare` and empty-category empty states. Verified after polish: full 14-algorithm regression suite still passes, confirming the visual changes didn't touch behavior.

Visit `/algorithm/trees/{bst-insert, bst-delete, in-order-traversal}`. All three visualization types (array, graph, tree) and four algorithm categories (sorting, searching, graphs, trees) are now live.

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
