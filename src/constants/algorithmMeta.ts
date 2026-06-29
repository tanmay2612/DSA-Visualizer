import {
  ArrowDownWideNarrow,
  Search,
  GitGraph,
  GitBranch,
  Grid3x3,
  Backpack,
  Gauge,
  TreeDeciduous,
  Layers,
  Layers3,
  ListOrdered,
  Link as LinkIcon,
} from 'lucide-react';
import type { SidebarCategoryItem } from '@/types';
import { ROUTES } from './routes';

/**
 * Single source of truth for sidebar navigation. `isAvailable: false`
 * categories still render (so the full scope of the project is visible
 * from day one) but are visually marked "Coming soon" instead of
 * linking to an empty page with no context. Flip to `true` as each
 * category gets real algorithms in later phases.
 */
export const SIDEBAR_CATEGORIES: SidebarCategoryItem[] = [
  {
    label: 'Sorting',
    category: 'sorting',
    path: ROUTES.algorithmsByCategory('sorting'),
    icon: ArrowDownWideNarrow,
    isAvailable: true,
  },
  {
    label: 'Searching',
    category: 'searching',
    path: ROUTES.algorithmsByCategory('searching'),
    icon: Search,
    isAvailable: true,
  },
  {
    label: 'Graphs',
    category: 'graphs',
    path: ROUTES.algorithmsByCategory('graphs'),
    icon: GitGraph,
    isAvailable: true,
  },
  {
    label: 'Trees',
    category: 'trees',
    path: ROUTES.algorithmsByCategory('trees'),
    icon: GitBranch,
    isAvailable: true,
  },
  {
    label: 'Dynamic Programming',
    category: 'dynamic-programming',
    path: ROUTES.algorithmsByCategory('dynamic-programming'),
    icon: Grid3x3,
    isAvailable: false,
  },
  {
    label: 'Backtracking',
    category: 'backtracking',
    path: ROUTES.algorithmsByCategory('backtracking'),
    icon: Backpack,
    isAvailable: false,
  },
  {
    label: 'Greedy',
    category: 'greedy',
    path: ROUTES.algorithmsByCategory('greedy'),
    icon: Gauge,
    isAvailable: false,
  },
  {
    label: 'Trie',
    category: 'trie',
    path: ROUTES.algorithmsByCategory('trie'),
    icon: TreeDeciduous,
    isAvailable: false,
  },
  {
    label: 'Heap',
    category: 'heap',
    path: ROUTES.algorithmsByCategory('heap'),
    icon: Layers,
    isAvailable: false,
  },
  {
    label: 'Stack',
    category: 'stack',
    path: ROUTES.algorithmsByCategory('stack'),
    icon: Layers3,
    isAvailable: false,
  },
  {
    label: 'Queue',
    category: 'queue',
    path: ROUTES.algorithmsByCategory('queue'),
    icon: ListOrdered,
    isAvailable: false,
  },
  {
    label: 'Linked List',
    category: 'linked-list',
    path: ROUTES.algorithmsByCategory('linked-list'),
    icon: LinkIcon,
    isAvailable: false,
  },
];
