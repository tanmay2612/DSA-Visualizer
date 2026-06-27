import { Star } from 'lucide-react';
import { Breadcrumb, PageContainer, SectionHeading, EmptyState } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useFavoritesStore } from '@/store/useFavoritesStore';

export default function FavoritesPage() {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  return (
    <PageContainer className="flex flex-col gap-8">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'Favorites' }]} />
      <SectionHeading title="Favorites" description="Algorithms you've starred for quick access." />
      <EmptyState
        icon={Star}
        title={favoriteIds.length === 0 ? 'No favorites yet' : 'Favorites view coming soon'}
        description={
          favoriteIds.length === 0
            ? 'Star an algorithm from its detail page to save it here for quick access.'
            : "You've favorited algorithms, but this page can't render them until the algorithm library exists."
        }
      />
    </PageContainer>
  );
}
