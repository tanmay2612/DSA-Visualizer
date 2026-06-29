import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

/**
 * Placeholder store, wired up properly in Phase 8 once
 * AlgorithmCard and FavoritesPage have real algorithm data to
 * reference. Implemented now (rather than left as a stub) since
 * the shape is simple and stable, and FavoritesPage's empty state
 * can already read from it correctly.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) =>
        set({
          favoriteIds: get().favoriteIds.includes(id)
            ? get().favoriteIds.filter((favId) => favId !== id)
            : [...get().favoriteIds, id],
        }),
      isFavorite: (id) => get().favoriteIds.includes(id),
    }),
    {
      name: 'vae-favorites',
    },
  ),
);
