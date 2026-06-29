import { ArrowRight, GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlaceholderPage } from '@/components/common';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

export default function ComparePage() {
  return (
    <PlaceholderPage
      title="Compare Algorithms"
      description="Run two algorithms side by side on the same input to see how their approach — and speed — differ."
      breadcrumbs={[{ label: 'Home', path: ROUTES.home }, { label: 'Compare' }]}
      emptyIcon={GitCompareArrows}
      emptyTitle="Side-by-side comparison is on the roadmap"
      emptyDescription="In the meantime, every algorithm already has its own page with full playback controls — browse the library to try them one at a time."
      emptyAction={
        <Button asChild size="sm">
          <Link to={ROUTES.algorithms}>
            Browse algorithms
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    />
  );
}
