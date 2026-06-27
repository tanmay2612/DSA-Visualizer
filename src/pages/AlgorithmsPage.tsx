import { LayoutGrid } from 'lucide-react';
import { PlaceholderPage } from '@/components/common';
import { ROUTES } from '@/constants/routes';

export default function AlgorithmsPage() {
  return (
    <PlaceholderPage
      title="All Algorithms"
      description="Browse every algorithm in the explorer, or jump into a category from the sidebar."
      breadcrumbs={[{ label: 'Home', path: ROUTES.home }, { label: 'Algorithms' }]}
      emptyIcon={LayoutGrid}
      emptyTitle="No algorithms yet"
      emptyDescription="The algorithm library is built out starting in Phase 4. Check back once sorting and searching land."
    />
  );
}
