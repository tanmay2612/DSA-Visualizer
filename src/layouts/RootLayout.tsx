import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer, MobileDrawer, Navbar, Sidebar } from '@/components/layout';
import { ErrorBoundary } from '@/components/common';

/**
 * Shell rendered once at the router root (see router/routes.tsx).
 * Every page renders through <Outlet />, inheriting nav, sidebar,
 * and footer for free — pages never re-implement chrome.
 *
 * The ErrorBoundary wraps ONLY the routed content, deliberately
 * outside Navbar/Sidebar/Footer — a crash in one page's render
 * should never take down navigation along with it. A more targeted
 * inline boundary also wraps AlgorithmDetailPage's canvas
 * specifically, since that's the highest-risk render path (custom
 * user input, three different adapters/canvases); this outer one is
 * the last-resort net for anything that slips past that or occurs
 * on a page with no boundary of its own.
 */
export function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
      <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <ErrorBoundary key={typeof window !== 'undefined' ? window.location.pathname : undefined}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  );
}
