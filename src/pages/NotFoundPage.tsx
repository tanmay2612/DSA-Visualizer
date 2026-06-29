import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, PageContainer } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="The page you're looking for doesn't exist, or hasn't been built yet."
        action={
          <Button asChild size="sm">
            <Link to={ROUTES.home}>Back to home</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
