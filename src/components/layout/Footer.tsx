import { Code2, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GITHUB_URL, NAV_ITEMS } from '@/constants/navigation';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Workflow className="size-5 text-accent" />
            Visual Algorithm Explorer
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            An interactive playground for understanding how data structures and algorithms actually
            work, one step at a time.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <nav className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Navigate
            </span>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Source
            </span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Code2 className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Built as a portfolio project to demonstrate algorithm visualization techniques.
        </p>
      </div>
    </footer>
  );
}
