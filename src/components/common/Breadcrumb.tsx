import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/cn';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'font-medium text-foreground' : 'text-muted-foreground')}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 text-muted-foreground" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
