import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router-dom';
import { interviewProblems } from '@/algorithms/interview';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Breadcrumb, PageContainer, SectionHeading } from '@/components/common';
import { ROUTES } from '@/constants/routes';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/**
 * Interview Problem Mode's landing page (Phase 10, Feature 2). Lists
 * the four fully-implemented problems (Two Sum, Maximum Subarray,
 * Valid Parentheses, Best Time to Buy and Sell Stock) — the exact
 * fallback subset the phase brief prioritizes. Deliberately doesn't
 * list Move Zeroes or Longest Common Prefix as "coming soon" tiles:
 * the brief explicitly says not to create fake unfinished problem
 * pages, so the honest move is to simply not list them here rather
 * than presenting a placeholder that looks like a smaller feature.
 */
export default function InterviewProblemsPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <Breadcrumb items={[{ label: 'Home', path: ROUTES.home }, { label: 'Interview Prep' }]} />

      <SectionHeading
        eyebrow="interview prep"
        title="Interview Problems"
        description="Classic coding-interview questions, worked step by step with the same playback engine used across the rest of this project."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interviewProblems.map((problem) => (
          <Link
            key={problem.id}
            to={ROUTES.interviewProblem(problem.id)}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-lg"
          >
            <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-border-strong">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{problem.name}</CardTitle>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{problem.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{DIFFICULTY_LABEL[problem.difficulty]}</Badge>
                  <Badge variant="mono">{problem.complexity.time.average}</Badge>
                  {problem.topics.map((topic) => (
                    <Badge key={topic} variant="muted">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <BriefcaseBusiness className="mt-0.5 size-4 shrink-0" />
        <span>
          More problems (Move Zeroes, Longest Common Prefix) are planned but not yet implemented
          — see the README&apos;s Future Improvements section.
        </span>
      </div>
    </PageContainer>
  );
}
