import Link from "next/link";
import { BrainCircuit, BookText, FlaskConical, Save } from "lucide-react";

import { SourceBadge } from "@/components/shared/source-badge";
import { TopicChip } from "@/components/shared/topic-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    authors: string[];
    publishedDate: string | null;
    relevanceScore: number;
    readingPriority: string;
    topicTags: string[];
    oneLineContribution: string;
    whyItMatters: string;
    source: string;
  };
}

function priorityVariant(priority: string): "danger" | "warning" | "muted" {
  if (priority === "Must Read") return "danger";
  if (priority === "Skim") return "warning";
  return "muted";
}

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <Card className="group transition duration-200 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/10">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-base leading-tight">{paper.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs text-slate-400">
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 ? " et al." : ""}
          </CardDescription>
        </div>

        <div className="flex flex-col items-end gap-1">
          <SourceBadge source={paper.source} />
          <Badge variant={priorityVariant(paper.readingPriority)}>{paper.readingPriority}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {paper.topicTags.slice(0, 3).map((topic) => (
            <TopicChip key={topic} topic={topic} />
          ))}
        </div>

        <p className="line-clamp-2 text-sm text-slate-200">{paper.oneLineContribution}</p>
        <p className="line-clamp-2 text-xs text-slate-400">{paper.whyItMatters}</p>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{paper.publishedDate ?? "Unknown date"}</span>
          <span>Relevance {(paper.relevanceScore * 100).toFixed(0)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/papers/${paper.id}`}>
              <BookText className="mr-1 h-3.5 w-3.5" /> Read
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/quiz?mode=paper-specific&paperId=${paper.id}`}>
              <FlaskConical className="mr-1 h-3.5 w-3.5" /> Quiz
            </Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/concepts?paperId=${paper.id}`}>
              <BrainCircuit className="mr-1 h-3.5 w-3.5" /> Concepts
            </Link>
          </Button>
          <Button size="sm" variant="ghost" disabled>
            <Save className="mr-1 h-3.5 w-3.5" /> Saved
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
