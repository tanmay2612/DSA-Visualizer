import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui';
import { SIDEBAR_CATEGORIES } from '@/constants/algorithmMeta';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';

interface SidebarContentProps {
  onNavigate?: () => void;
}

/**
 * The actual nav list, extracted from any chrome (no <aside>
 * wrapper here) so DesktopSidebar and the MobileDrawer can each
 * wrap it in their own container without duplicating the link
 * markup and active-state logic.
 */
export function SidebarContent({ onNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col gap-1 p-3">
      <NavLink
        to={ROUTES.algorithms}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )
        }
      >
        All Algorithms
      </NavLink>

      <div className="my-2 h-px bg-border" />

      <p className="px-3 pb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Categories
      </p>

      {SIDEBAR_CATEGORIES.map(({ label, path, icon: Icon, isAvailable }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-surface-hover text-foreground'
                : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
            )
          }
        >
          <span className="flex items-center gap-2.5">
            <Icon className="size-4" />
            {label}
          </span>
          {!isAvailable && (
            <Badge variant="muted" className="text-[10px]">
              Soon
            </Badge>
          )}
        </NavLink>
      ))}
    </div>
  );
}
