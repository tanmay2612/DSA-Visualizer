import type { LucideIcon } from 'lucide-react';
import { Breadcrumb, EmptyState, PageContainer, SectionHeading } from '@/components/common';
import type { BreadcrumbItem } from '@/types';

interface PlaceholderPageProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * Every route that doesn't yet have real content (category pages,
 * detail page, compare, favorites) renders through this shell, so
 * they share identical structure and only differ in copy/icon —
 * exactly what the Phase 1 spec asks for, without 6 near-duplicate
 * page components.
 */
export function PlaceholderPage({
  title,
  description,
  breadcrumbs,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: PlaceholderPageProps) {
  return (
    <PageContainer className="flex flex-col gap-8">
      <Breadcrumb items={breadcrumbs} />
      <SectionHeading title={title} description={description} />
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    </PageContainer>
  );
}
