import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Breadcrumb, EmptyState, PageContainer, SectionHeading } from '@/components/common';
import type { BreadcrumbItem } from '@/types';

interface PlaceholderPageProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  /** Optional helpful CTA shown beneath the empty state's message —
   *  e.g. a link to somewhere with real content, per the "every
   *  empty state needs a helpful CTA" polish requirement. */
  emptyAction?: ReactNode;
}

/**
 * Every route that doesn't yet have real content (compare, for now)
 * renders through this shell, so they share identical structure and
 * only differ in copy/icon/action.
 */
export function PlaceholderPage({
  title,
  description,
  breadcrumbs,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: PlaceholderPageProps) {
  return (
    <PageContainer className="flex flex-col gap-8">
      <Breadcrumb items={breadcrumbs} />
      <SectionHeading title={title} description={description} />
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    </PageContainer>
  );
}
