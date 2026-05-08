import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReviewQueue({
  items
}: {
  items: Array<{
    questionId: string;
    question: string;
    type: string;
    nextReviewAt: string | null;
    masteryScore: number;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Review Queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">No due reviews. Use Random Drill to keep momentum.</p>
        ) : (
          items.map((item) => (
            <Link key={item.questionId} href="/quiz?mode=daily-review">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-primary/10">
                <p className="line-clamp-2 text-sm text-slate-100">{item.question}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="warning">{item.type}</Badge>
                  <span className="text-xs text-slate-400">mastery {item.masteryScore?.toFixed(0) ?? 0}%</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
