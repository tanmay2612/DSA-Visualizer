import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 'page' fills available space with generous padding, for a
   *  route-level boundary. 'inline' is compact, for wrapping a
   *  smaller subtree (e.g. just a canvas) without the fallback
   *  itself looking like a whole broken page. */
  variant?: 'page' | 'inline';
  /** Optional label shown in the fallback, e.g. "visualization" so
   *  the message reads as "Something went wrong with the
   *  visualization" rather than a generic, context-free apology. */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * React error boundaries must be class components — there is still
 * no hook equivalent as of React 19, so this is the one place in
 * the app that's a class rather than a function component, by
 * necessity rather than preference.
 *
 * Without this, any render-time error anywhere in the tree (a bad
 * adapter output, a malformed custom array slipping past validation,
 * a third-party library issue) white-screens the entire app with no
 * recovery path — that gap existed through Phase 8 with zero
 * boundaries anywhere in the codebase, confirmed by grepping for
 * any prior error-handling infrastructure before writing this.
 *
 * Deliberately does NOT try to auto-recover or retry rendering the
 * same subtree with the same props, since whatever caused the crash
 * is still present in state — the reset button calls
 * `window.location.reload()`, a full reload, rather than just
 * clearing local error state and re-rendering into the same bad
 * state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logged to the console rather than sent anywhere — this app has
    // no backend/telemetry service to report to (see architecture
    // doc: "no backend, everything runs in the browser"), so a
    // console log is the honest extent of error reporting available
    // here, not a stand-in for a real error-tracking integration.
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  override render() {
    const { error } = this.state;
    const { children, variant = 'page', label } = this.props;

    if (!error) return children;

    const title = label ? `Something went wrong with the ${label}` : 'Something went wrong';

    return (
      <div
        className={cn(
          'flex flex-col items-center gap-4 rounded-lg border border-dashed border-destructive/30 text-center',
          variant === 'page' ? 'px-6 py-20' : 'px-4 py-10',
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-foreground">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Reload page
          </Button>
          {variant === 'page' && (
            <Button size="sm" variant="outline" asChild>
              <a href="/">
                <Home className="size-4" />
                Go home
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }
}
