import type { LucideIcon } from 'lucide-react';
import type { AlgorithmCategory } from './algorithm.types';

export interface NavItem {
  label: string;
  path: string;
}

export interface SidebarCategoryItem {
  label: string;
  category: AlgorithmCategory;
  path: string;
  icon: LucideIcon;
  /** Set once real algorithms exist for this category (Phase 4+). */
  isAvailable: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
