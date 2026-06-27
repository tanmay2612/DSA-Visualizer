import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Every page body renders inside this — single place to control
 * max-width, horizontal padding, and vertical rhythm so pages
 * don't each reinvent their own container spacing.
 */
export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8', className)}
      {...props}
    />
  );
}
