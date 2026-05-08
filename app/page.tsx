import Link from "next/link";
import { ArrowRight, Network, Sparkles } from "lucide-react";

import { DailyBriefingPanel } from "@/components/dashboard/daily-briefing-panel";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { ReviewQueue } from "@/components/dashboard/review-queue";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardPayload } from "@/lib/services/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardPayload();

  return (
    <div className="space-y-4 pb-8">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {data.briefing ? (
          <DailyBriefingPanel
            text={data.briefing.briefingText}
            topPapers={data.briefing.topPapers}
            weakConcepts={data.briefing.weakConcepts}
            recommendedQuestions={data.briefing.recommendedQuestions}
          />
        ) : (
          <EmptyState
            title="No daily briefing yet"
            description="Run `pnpm pipeline:daily` or `pnpm db:seed` to generate today's briefing."
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Interview Drill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.interviewDrill.map((prompt) => (
              <div key={prompt.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="text-xs text-slate-400">{prompt.mode}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-100">{prompt.question}</p>
              </div>
            ))}
            <Button className="w-full" asChild>
              <Link href="/interview">Open Interview Mode</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Paper Radar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.todaysPapers.length === 0 ? (
              <p className="text-xs text-slate-400">No paper collected today.</p>
            ) : (
              data.todaysPapers.map((paper) => (
                <Link key={paper.id} href={`/papers/${paper.id}`}>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/40 hover:bg-primary/10">
                    <p className="line-clamp-2 text-sm text-slate-100">{paper.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{paper.topicTags.slice(0, 2).join(" · ")}</span>
                      <span>{Math.round(paper.relevanceScore * 100)}%</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/papers">
                Open Radar <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <ReviewQueue items={data.reviewQueue} />

        <Card>
          <CardHeader>
            <CardTitle>Weak Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.weakConcepts.map((concept) => (
              <Link key={concept.id} href={`/concepts/${concept.id}`}>
                <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-primary/10">
                  <p className="text-sm font-medium text-slate-100">{concept.name}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{concept.domain}</span>
                    <Badge variant={concept.masteryScore < 45 ? "danger" : "warning"}>
                      {concept.masteryScore.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
            <Button variant="outline" size="sm" asChild>
              <Link href="/concepts">Open Atlas</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <ProgressChart series={data.progressSeries} />

        <Card>
          <CardHeader>
            <CardTitle>Topic Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topicHeatmap.map((item) => (
              <div key={item.domain}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                  <span>{item.domain}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${Math.min(100, item.count * 14)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Must Read Papers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.mustRead.length === 0 ? (
              <p className="text-xs text-slate-400">No pending Must Read paper.</p>
            ) : (
              data.mustRead.map((paper) => (
                <Link key={paper.id} href={`/papers/${paper.id}`}>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-primary/10">
                    <p className="text-sm font-medium text-slate-100">{paper.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{paper.whyItMatters}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Graph Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <Network className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Active Links</span>
              </div>
              <p className="text-2xl font-semibold text-slate-100">{data.graphPreview.length}</p>
              <p className="text-xs text-slate-400">paper-concept relations visible now</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-violet-200">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Next Action</span>
              </div>
              <p className="text-sm text-slate-200">Inspect relation edges, then open Quiz Arena for weakest concept nodes.</p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/graph">Open Knowledge Graph</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
