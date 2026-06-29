import { Layers, Sparkles, Zap } from 'lucide-react';
import { Breadcrumb, PageContainer, SectionHeading } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ROUTES } from '@/constants/routes';

const PRINCIPLES = [
  {
    icon: Layers,
    title: 'One engine, every algorithm',
    description:
      'Every visualization runs through the same step-based engine, so sorting, searching, graph, and tree algorithms all share one playback model instead of being rebuilt per algorithm.',
  },
  {
    icon: Zap,
    title: 'Logic separate from rendering',
    description:
      'Algorithm implementations are plain TypeScript with no UI dependencies. The canvas only ever knows what to draw, never why.',
  },
  {
    icon: Sparkles,
    title: 'Built to be read, not just run',
    description:
      'Pseudocode, complexity, and real source code sit next to every visualization, because seeing an algorithm work only helps if you can connect it back to the code.',
  },
];

export default function AboutPage() {
  return (
    <PageContainer className="flex flex-col gap-10">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'About' }]} />

      <SectionHeading
        eyebrow="About"
        title="Why this project exists"
        description="Visual Algorithm Explorer is a browser-based tool for understanding data structures and algorithms by watching them run, one step at a time, instead of only reading about them."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {PRINCIPLES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="mb-2 size-5 text-accent" />
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6">
        <h3 className="font-semibold text-foreground">Status</h3>
        <p className="text-sm text-muted-foreground">
          The project is being built in phases: foundation and navigation first, then the
          visualization engine, then the algorithm library itself, category by category. Routes for
          algorithms that don't exist yet will say so plainly rather than pretending to be finished.
        </p>
      </div>
    </PageContainer>
  );
}
