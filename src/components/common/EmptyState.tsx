import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shown on every placeholder page until its real content lands in
 * a later phase. Per the writing guidance: an empty screen is an
 * invitation to act, so it explains what's missing and, where
 * possible, what to do next rather than just saying "nothing here."
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-surface">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
