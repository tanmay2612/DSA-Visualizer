interface StatsPanelProps {
  currentIndex: number;
  totalSteps: number;
}

/**
 * Deliberately minimal for Phase 2 — just "step X of Y". The
 * architecture doc's fuller StatsPanel (comparison/swap counters)
 * is meaningful once more than one algorithm exists to compare
 * against; adding fields here later doesn't change how this
 * component is consumed by AlgorithmDetailPage.
 */
export function StatsPanel({ currentIndex, totalSteps }: StatsPanelProps) {
  const displayStep = Math.max(currentIndex + 1, 0);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
      <span className="text-muted-foreground">Step</span>
      <span className="font-mono font-medium text-foreground">{displayStep}</span>
      <span className="text-muted-foreground">/ {totalSteps}</span>
    </div>
  );
}
