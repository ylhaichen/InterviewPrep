import Link from "next/link";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { TopicChip } from "@/components/shared/topic-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReaderProps {
  paper: {
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    sourceUrl: string;
    pdfUrl: string | null;
    topicTags: string[];
    readingPriority: string;
    relevanceScore: number;
    summary: {
      tldr: string;
      problem: string;
      motivation: string;
      coreIdea: string;
      methodPipeline: string;
      architecture: string;
      trainingObjective: string;
      datasets: string;
      benchmarks: string;
      mainResults: string;
      limitations: string;
      implementationNotes: string;
      interviewValue: string;
    } | null;
    linkedConcepts: Array<{
      conceptId: string;
      name: string;
      domain: string;
      difficulty: string;
      strength: number;
    }>;
    relatedQuestions: Array<{
      id: string;
      question: string;
      type: string;
      difficulty: string;
      conceptId: string | null;
    }>;
  };
}

function SummaryBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1 rounded-xl border border-white/15 bg-white/5 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-cyan-200">{title}</h4>
      <p className="text-sm leading-6 text-slate-200">{content}</p>
    </div>
  );
}

export function PaperReaderView({ paper }: ReaderProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[270px_1fr_320px]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Paper Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-300">
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Title</p>
            <p>{paper.title}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Authors</p>
            <p>{paper.authors.join(", ")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">{paper.readingPriority}</Badge>
            <Badge variant="primary">{Math.round(paper.relevanceScore * 100)}%</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {paper.topicTags.map((topic) => (
              <TopicChip key={topic} topic={topic} />
            ))}
          </div>
          <div className="space-y-2">
            <Button size="sm" variant="outline" asChild>
              <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
                Open Source
              </a>
            </Button>
            {paper.pdfUrl ? (
              <Button size="sm" variant="ghost" asChild>
                <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="ghost" disabled>
                Open PDF (Unavailable)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg">Structured Explanation</CardTitle>
            <CardDescription>{paper.summary ? "Generated from pipeline" : "Summary not ready"}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled>
              Explain like interview (Coming from local LLM adapter)
            </Button>
            <Button size="sm" variant="outline" disabled>
              Explain with math (Waiting symbolic parser)
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {paper.summary ? (
            <>
              <SummaryBlock title="TL;DR" content={paper.summary.tldr} />
              <SummaryBlock title="Problem" content={paper.summary.problem} />
              <SummaryBlock title="Motivation" content={paper.summary.motivation} />
              <SummaryBlock title="Core Idea" content={paper.summary.coreIdea} />
              <SummaryBlock title="Method Pipeline" content={paper.summary.methodPipeline} />
              <SummaryBlock title="Architecture" content={paper.summary.architecture} />
              <SummaryBlock title="Training Objective" content={paper.summary.trainingObjective} />
              <SummaryBlock title="Datasets" content={paper.summary.datasets} />
              <SummaryBlock title="Benchmarks" content={paper.summary.benchmarks} />
              <SummaryBlock title="Main Results" content={paper.summary.mainResults} />
              <SummaryBlock title="Limitations" content={paper.summary.limitations} />
              <SummaryBlock title="Implementation Notes" content={paper.summary.implementationNotes} />
              <SummaryBlock title="Interview Value" content={paper.summary.interviewValue} />
            </>
          ) : (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-slate-200">
              Summary generation has not run for this paper yet. Use pipeline command `pnpm papers:summaries` or
              re-import/process.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Concepts & Questions</CardTitle>
          <CardDescription>Right-context interview panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Linked Concepts</h4>
            {paper.linkedConcepts.length === 0 ? (
              <p className="text-xs text-slate-400">No linked concepts yet.</p>
            ) : (
              paper.linkedConcepts.map((concept) => (
                <Link key={concept.conceptId} href={`/concepts/${concept.conceptId}`}>
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 transition hover:border-primary/40 hover:bg-primary/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-100">{concept.name}</p>
                      <DifficultyBadge value={concept.difficulty} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{concept.domain}</p>
                    <p className="mt-1 text-xs text-slate-300">Relation strength {(concept.strength * 100).toFixed(0)}%</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Generated Questions</h4>
            {paper.relatedQuestions.length === 0 ? (
              <p className="text-xs text-slate-400">No questions yet.</p>
            ) : (
              paper.relatedQuestions.slice(0, 8).map((question) => (
                <div key={question.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <p className="line-clamp-2 text-sm text-slate-100">{question.question}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{question.type}</span>
                    <span>{question.difficulty}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button className="w-full" asChild>
            <Link href={`/quiz?mode=paper-specific&paperId=${paper.id}`}>Generate / Practice 5 Questions</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
