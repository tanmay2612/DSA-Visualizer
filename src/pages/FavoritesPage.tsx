import { Star } from 'lucide-react';
import { getAlgorithmById } from '@/algorithms/registry';
import {
  AlgorithmCard,
  Breadcrumb,
  EmptyState,
  PageContainer,
  SectionHeading,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export default function FavoritesPage() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  // Resolve ids to real algorithm objects, dropping any id that no
  // longer resolves (e.g. an algorithm's id changed between
  // releases) rather than rendering a broken card or crashing.
  const favoriteAlgorithms = favoriteIds
    .map((id) => getAlgorithmById(id))
    .filter((algorithm) => algorithm !== undefined);

  return (
    <PageContainer className="flex flex-col gap-8">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'Favorites' }]} />
      <SectionHeading title="Favorites" description="Algorithms you've starred for quick access." />

      {favoriteAlgorithms.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No favorites yet"
          description="Star an algorithm from its detail page to save it here for quick access."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteAlgorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
