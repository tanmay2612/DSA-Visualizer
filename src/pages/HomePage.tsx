import { ArrowRight, BarChart3, Boxes, GitBranch, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GradientBlobBackground, HeroVisualization, PageContainer } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { SIDEBAR_CATEGORIES } from '@/constants/algorithmMeta';
import { getAllAlgorithms } from '@/algorithms/registry';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Step through, not just watch',
    description:
      'Play, pause, step forward or backward, and scrub to any point in an algorithm\u2019s execution — at your own pace, not a fixed video.',
  },
  {
    icon: Boxes,
    title: 'One engine for every algorithm',
    description:
      'Sorting, searching, graphs, and trees all run through the same playback model, so the controls you learn once work everywhere.',
  },
  {
    icon: Network,
    title: 'Built to be inspected',
    description:
      'Every visualization sits next to its pseudocode, complexity, and real source — so you can connect what you see to what\u2019s actually running.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const algorithmCount = getAllAlgorithms().length;
  const previewCategories = SIDEBAR_CATEGORIES.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <div className="relative">
        <GradientBlobBackground />
        <PageContainer className="flex flex-col items-center gap-10 py-20 text-center sm:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5"
          >
            <Badge variant="mono" className="text-accent">
              data structures &amp; algorithms, visualized
            </Badge>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Watch algorithms think, <span className="text-accent">one step at a time.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Visual Algorithm Explorer turns sorting, searching, graph, and tree algorithms into
              interactive, controllable animations — built for the moment you finally see why an
              algorithm works.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to={ROUTES.algorithms}>
                  Explore algorithms
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.about}>How it works</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full max-w-xl"
          >
            <HeroVisualization />
          </motion.div>
        </PageContainer>
      </div>

      {/* Feature cards */}
      <PageContainer className="flex flex-col gap-10 border-t border-border py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2 text-center"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Why it works this way
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built around understanding, not just output
          </h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="group h-full">
                <CardHeader>
                  <div className="mb-1 flex size-9 items-center justify-center rounded-md bg-accent/10 transition-colors group-hover:bg-accent/15">
                    <Icon className="size-4.5 text-accent" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </PageContainer>

      {/* Category grid */}
      <PageContainer className="flex flex-col gap-10 border-t border-border py-20">
        <div className="flex flex-col gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            What's available now
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {algorithmCount} algorithms, four categories, growing
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Sorting, searching, graphs, and trees are live today. The remaining categories are being
            built out one at a time — nothing here pretends to be finished before it is.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {previewCategories.map(({ label, path, icon: Icon, isAvailable }) => (
            <Link
              key={path}
              to={path}
              className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-accent" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </span>
              {!isAvailable && (
                <Badge variant="muted" className="text-[10px]">
                  Soon
                </Badge>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link to={ROUTES.algorithms}>
              View all categories
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </PageContainer>

      {/* CTA */}
      <PageContainer className="border-t border-border py-20">
        <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-xl border border-border bg-surface px-6 py-12 text-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.07]"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, var(--color-accent-500), transparent 60%)',
            }}
          />
          <GitBranch className="size-8 text-accent" />
          <h2 className="max-w-md text-2xl font-semibold tracking-tight text-foreground">
            Curious how it's built under the hood?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Every visualization runs on the same algorithm engine — pure logic in, animated steps
            out. Read about the architecture behind it.
          </p>
          <Button asChild>
            <Link to={ROUTES.about}>
              Read about the project
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
