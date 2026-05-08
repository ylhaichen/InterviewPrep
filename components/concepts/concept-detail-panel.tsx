import Link from "next/link";

import { TopicChip } from "@/components/shared/topic-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConceptDetailProps {
  concept: {
    id: string;
    name: string;
    domain: string;
    difficulty: string;
    aliases: string[];
    shortDefinition: string;
    deepExplanation: string;
    whyItMatters: string;
    minimalExample: string;
    mathNotes: string | null;
    commonConfusions: string[];
    interviewQuestions: string[];
    masteryScore: number;
    relatedPapers: Array<{ id: string; title: string; readingPriority: string; relationStrength: number }>;
    relatedQuestions: Array<{ id: string; question: string; type: string; difficulty: string }>;
  };
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-200">{content}</p>
    </div>
  );
}

export function ConceptDetailPanel({ concept }: ConceptDetailProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg">{concept.name}</CardTitle>
            <p className="text-xs text-slate-400">{concept.domain}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{concept.difficulty}</Badge>
            <Badge variant="primary">mastery {concept.masteryScore.toFixed(0)}%</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {concept.aliases.map((alias) => (
              <TopicChip key={alias} topic={alias} />
            ))}
          </div>

          <InfoBlock title="Definition" content={concept.shortDefinition} />
          <InfoBlock title="Core Intuition" content={concept.deepExplanation} />
          <InfoBlock title="Why It Matters" content={concept.whyItMatters} />
          <InfoBlock title="Minimal Example" content={concept.minimalExample} />
          {concept.mathNotes ? <InfoBlock title="Math Notes" content={concept.mathNotes} /> : null}

          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Common Mistakes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {concept.commonConfusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Interview Questions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {concept.interviewQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Related Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Related Papers</p>
            {concept.relatedPapers.map((paper) => (
              <Link key={paper.id} href={`/papers/${paper.id}`}>
                <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-primary/10">
                  <p className="line-clamp-2 text-sm text-slate-100">{paper.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {paper.readingPriority} · strength {(paper.relationStrength * 100).toFixed(0)}%
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Quiz Items</p>
            {concept.relatedQuestions.slice(0, 8).map((question) => (
              <div key={question.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="line-clamp-2 text-sm text-slate-100">{question.question}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {question.type} · {question.difficulty}
                </p>
              </div>
            ))}
          </div>

          <Button className="w-full" asChild>
            <Link href={`/quiz?mode=weak-concepts&conceptId=${concept.id}`}>Open Quiz Arena</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
