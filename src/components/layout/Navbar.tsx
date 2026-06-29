import { Code2, Menu, Moon, Sun, Workflow } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui';
import { SearchBar } from '@/components/common';
import { NAV_ITEMS, GITHUB_URL } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/cn';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        <NavLink to={ROUTES.home} className="flex items-center gap-2 font-semibold">
          <Workflow className="size-5 text-accent" />
          <span className="hidden sm:inline">Visual Algorithm Explorer</span>
          <span className="sm:hidden">VAE</span>
        </NavLink>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchBar containerClassName="hidden w-56 md:block" />

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
            >
              <Code2 className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
