import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DailyBriefingPanel({
  text,
  topPapers,
  weakConcepts,
  recommendedQuestions
}: {
  text: string;
  topPapers: string[];
  weakConcepts: string[];
  recommendedQuestions: string[];
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-cyan-400/25 blur-3xl" />
      <CardHeader>
        <CardTitle>Daily Briefing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-slate-200">{text}</p>
        <div className="grid gap-2 text-xs text-slate-300 md:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="font-semibold text-slate-100">Top Papers</p>
            <p>{topPapers.length}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="font-semibold text-slate-100">Weak Concepts</p>
            <p>{weakConcepts.length}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="font-semibold text-slate-100">Recommended Questions</p>
            <p>{recommendedQuestions.length}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link href="/papers">Open Paper Radar</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/quiz?mode=daily-review">Start Review</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
