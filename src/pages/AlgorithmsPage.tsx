import { LayoutGrid } from 'lucide-react';
import { getAllAlgorithms } from '@/algorithms/registry';
import {
  AlgorithmCard,
  Breadcrumb,
  EmptyState,
  PageContainer,
  SectionHeading,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { SIDEBAR_CATEGORIES } from '@/constants/algorithmMeta';

export default function AlgorithmsPage() {
  const algorithms = getAllAlgorithms();

  // Group by category, but only emit a section for categories that
  // actually have at least one algorithm — iterating the full
  // 12-entry sidebar list here would print 11 empty "coming soon"
  // sections above the one category that's real, which is worse
  // than just not mentioning the empty ones on this particular page
  // (the sidebar already communicates "coming soon" for those).
  const categoriesWithContent = SIDEBAR_CATEGORIES.filter((entry) =>
    algorithms.some((algorithm) => algorithm.category === entry.category),
  );

  return (
    <PageContainer className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'Algorithms' }]} />

      <SectionHeading
        title="All Algorithms"
        description="Browse every algorithm in the explorer, or jump into a category from the sidebar."
      />

      {categoriesWithContent.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No algorithms yet"
          description="The algorithm library is being built out category by category. Check the sidebar for what's coming."
        />
      ) : (
        categoriesWithContent.map((category) => {
          const categoryAlgorithms = algorithms.filter((a) => a.category === category.category);
          return (
            <div key={category.category} className="flex flex-col gap-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <category.icon className="size-5 text-accent" />
                {category.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryAlgorithms.map((algorithm) => (
                  <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </PageContainer>
  );
}
