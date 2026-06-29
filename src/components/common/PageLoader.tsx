import { Skeleton } from '@/components/ui';
import { PageContainer } from './PageContainer';

export function PageLoader() {
  return (
    <PageContainer className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full" />
    </PageContainer>
  );
}
