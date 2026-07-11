import type { NavItem } from '@/types';
import { ROUTES } from './routes';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Algorithms', path: ROUTES.algorithms },
  { label: 'Interview Prep', path: ROUTES.interview },
  { label: 'Compare', path: ROUTES.compare },
  { label: 'Favorites', path: ROUTES.favorites },
  { label: 'About', path: ROUTES.about },
];

export const GITHUB_URL = 'https://github.com';
