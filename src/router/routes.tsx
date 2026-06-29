/* eslint-disable react-refresh/only-export-components -- this module
   exports lazy() references and router config, not components; it is
   never a fast-refresh boundary. */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { PageLoader } from '@/components/common/PageLoader';

/**
 * Every page is lazy-loaded. This matters more than it looks: once
 * Phase 6/7 add graph and tree visualization code (force-directed
 * layout math, canvas rendering logic), those bundles should only
 * load when a user actually visits a graph or tree route — not be
 * bundled into the initial HomePage load.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const AlgorithmsPage = lazy(() => import('@/pages/AlgorithmsPage'));
const AlgorithmCategoryPage = lazy(() => import('@/pages/AlgorithmCategoryPage'));
const AlgorithmDetailPage = lazy(() => import('@/pages/AlgorithmDetailPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function withSuspense(Component: React.LazyExoticComponent<() => React.JSX.Element>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'algorithms', element: withSuspense(AlgorithmsPage) },
      { path: 'algorithms/:category', element: withSuspense(AlgorithmCategoryPage) },
      { path: 'algorithm/:category/:name', element: withSuspense(AlgorithmDetailPage) },
      { path: 'compare', element: withSuspense(ComparePage) },
      { path: 'favorites', element: withSuspense(FavoritesPage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: '*', element: withSuspense(NotFoundPage) },
    ],
  },
]);
