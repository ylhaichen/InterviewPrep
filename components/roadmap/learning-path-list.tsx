import { ProgressRing } from "@/components/ui/progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LearningPathList({
  paths
}: {
  paths: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    masteryScore: number;
    conceptIds: string[];
    paperIds: string[];
    questionIds: string[];
  }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {paths.map((path) => (
        <Card key={path.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">{path.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <p className="text-sm text-slate-300">{path.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-200">Concepts</p>
                <p>{path.conceptIds.length}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-200">Papers</p>
                <p>{path.paperIds.length}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-200">Questions</p>
                <p>{path.questionIds.length}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="font-semibold text-slate-200">Mastery</p>
                <p>{path.masteryScore.toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex justify-center">
              <ProgressRing value={path.progress} label="Path Progress" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
