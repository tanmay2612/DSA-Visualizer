/**
 * Centralized route paths. Every Link, NavLink, breadcrumb, and
 * router definition imports from here rather than hardcoding
 * strings — renaming a route later means changing one line, not
 * grepping the codebase.
 */
export const ROUTES = {
  home: '/',
  algorithms: '/algorithms',
  algorithmsByCategory: (category: string) => `/algorithms/${category}`,
  algorithmDetail: (category: string, name: string) => `/algorithm/${category}/${name}`,
  compare: '/compare',
  favorites: '/favorites',
  about: '/about',
} as const;
