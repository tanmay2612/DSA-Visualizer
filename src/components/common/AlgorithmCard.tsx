import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AlgorithmDefinition } from '@/algorithms/shared/types';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

interface AlgorithmCardProps {
  algorithm: AlgorithmDefinition<unknown>;
}

const DIFFICULTY_LABEL: Record<AlgorithmDefinition<unknown>['difficulty'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/**
 * One card per algorithm, used by AlgorithmCategoryPage's grid (and
 * later AlgorithmsPage / FavoritesPage, which can reuse this
 * unchanged since it only depends on AlgorithmDefinition — the same
 * shape every category's algorithms share).
 */
export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  return (
    <Link
      to={ROUTES.algorithmDetail(algorithm.category, algorithm.id)}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-lg"
    >
      <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-border-strong">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{algorithm.name}</CardTitle>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{algorithm.description}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{DIFFICULTY_LABEL[algorithm.difficulty]}</Badge>
            <Badge variant="mono">{algorithm.complexity.time.average}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
