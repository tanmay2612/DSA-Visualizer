import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer, MobileDrawer, Navbar, Sidebar } from '@/components/layout';

/**
 * Shell rendered once at the router root (see router/routes.tsx).
 * Every page renders through <Outlet />, inheriting nav, sidebar,
 * and footer for free — pages never re-implement chrome.
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
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
