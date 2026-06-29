import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shown on every placeholder page and "nothing here yet" state.
 * Per the writing guidance: an empty screen is an invitation to
 * act, so it explains what's missing and, where possible, what to
 * do next rather than just saying "nothing here." Polish pass:
 * softer icon badge (ring + tinted background instead of a flat
 * circle) and a gentle entrance animation, since this component
 * appears across many pages and a static instant-appear read as
 * abrupt next to everything else's animated entrances.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
        <Icon className="size-6 text-accent" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </motion.div>
  );
}
