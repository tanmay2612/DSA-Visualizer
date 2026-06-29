import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { getAlgorithmsByCategory } from '@/algorithms/registry';
import {
  AlgorithmCard,
  Breadcrumb,
  EmptyState,
  PageContainer,
  SectionHeading,
} from '@/components/common';
import { Button } from '@/components/ui';
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

  // The actual source of truth for "does this category have
  // content" is the registry, not the sidebar's isAvailable flag —
  // the flag is a coarse signal for navigation, this is the real
  // query. Querying it directly here means this page can never
  // drift out of sync with what algorithms actually exist, the way
  // a second hardcoded "is this ready" flag could.
  const algorithms = getAlgorithmsByCategory(matched.category);

  return (
    <PageContainer className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: 'Home', path: ROUTES.home },
          { label: 'Algorithms', path: ROUTES.algorithms },
          { label: matched.label },
        ]}
      />

      <SectionHeading
        title={matched.label}
        description={`Step-by-step visualizations for ${matched.label.toLowerCase()} algorithms.`}
      />

      {algorithms.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title={`${matched.label} algorithms are coming soon`}
          description="This category is on the roadmap and will be filled in during a later development phase."
          action={
            <Button asChild size="sm">
              <Link to={ROUTES.algorithms}>
                See what's available now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}
