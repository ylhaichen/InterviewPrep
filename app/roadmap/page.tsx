import { LearningPathList } from "@/components/roadmap/learning-path-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listLearningPaths } from "@/lib/services/roadmap";

export default async function RoadmapPage() {
  const paths = await listLearningPaths();

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Learning Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Structured paths from robotics action basics to embodied intelligence synthesis. Progress and mastery are driven by linked concepts/questions.
          </p>
        </CardContent>
      </Card>

      <LearningPathList paths={paths} />
    </div>
  );
}
