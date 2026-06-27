import { Search } from 'lucide-react';
import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

/**
 * Reusable search input. Phase 1 renders this in the Navbar and on
 * placeholder pages without wiring real filtering — search logic
 * lands once the algorithm registry exists (Phase 4+).
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, placeholder = 'Search algorithms...', ...props }, ref) => (
    <div className={cn('relative w-full', containerClassName)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
SearchBar.displayName = 'SearchBar';
