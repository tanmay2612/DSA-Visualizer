import { GitCompareArrows } from 'lucide-react';
import { PlaceholderPage } from '@/components/common';
import { ROUTES } from '@/constants/routes';

export default function ComparePage() {
  return (
    <PlaceholderPage
      title="Compare Algorithms"
      description="Run two algorithms side by side on the same input to see how their approach — and speed — differ."
      breadcrumbs={[{ label: 'Home', path: ROUTES.home }, { label: 'Compare' }]}
      emptyIcon={GitCompareArrows}
      emptyTitle="Comparison mode is on the roadmap"
      emptyDescription="Side-by-side visualization will be available once individual algorithm pages are complete."
    />
  );
}
