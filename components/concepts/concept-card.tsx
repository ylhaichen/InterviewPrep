import Link from "next/link";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConceptCardProps {
  concept: {
    id: string;
    name: string;
    domain: string;
    difficulty: string;
    shortDefinition: string;
    masteryScore: number;
    commonConfusions: string[];
  };
}

function masteryVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 75) return "success";
  if (score >= 45) return "warning";
  return "danger";
}

export function ConceptCard({ concept }: ConceptCardProps) {
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:border-primary/40">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-base">{concept.name}</CardTitle>
          <p className="text-xs text-slate-400">{concept.domain}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <DifficultyBadge value={concept.difficulty} />
          <Badge variant={masteryVariant(concept.masteryScore)}>
            mastery {concept.masteryScore.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-slate-200">{concept.shortDefinition}</p>
        <p className="line-clamp-2 text-xs text-slate-400">
          Common confusion: {concept.commonConfusions[0] ?? "No confusion note yet"}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/concepts/${concept.id}`}>Open Detail</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/quiz?mode=weak-concepts&conceptId=${concept.id}`}>Practice</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
