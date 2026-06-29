import { SidebarContent } from './SidebarContent';

/**
 * Desktop-only sidebar (hidden below lg breakpoint, where
 * MobileDrawer takes over). Sticky beneath the navbar so it stays
 * visible while page content scrolls.
 */
export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border lg:block">
      <SidebarContent />
    </aside>
  );
}
