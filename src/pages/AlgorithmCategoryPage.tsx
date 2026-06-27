import { LayoutGrid } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PlaceholderPage } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { SIDEBAR_CATEGORIES } from '@/constants/algorithmMeta';
import NotFoundPage from './NotFoundPage';

export default function AlgorithmCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const matched = SIDEBAR_CATEGORIES.find((entry) => entry.category === category);

  // Unknown category in the URL — render the 404 rather than a
  // confusing empty page that looks like a real, just-empty category.
  if (!matched) {
    return <NotFoundPage />;
  }

  return (
    <PlaceholderPage
      title={matched.label}
      description={`Step-by-step visualizations for ${matched.label.toLowerCase()} algorithms.`}
      breadcrumbs={[
        { label: 'Home', path: ROUTES.home },
        { label: 'Algorithms', path: ROUTES.algorithms },
        { label: matched.label },
      ]}
      emptyIcon={LayoutGrid}
      emptyTitle={`${matched.label} algorithms are coming soon`}
      emptyDescription="This category is on the roadmap and will be filled in during a later development phase."
    />
  );
}
