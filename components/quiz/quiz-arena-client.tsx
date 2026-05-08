"use client";

import { useEffect, useMemo, useState } from "react";

import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const MODES = [
  { value: "daily-review", label: "Daily Review" },
  { value: "weak-concepts", label: "Weak Concepts" },
  { value: "vla-interview", label: "VLA Interview" },
  { value: "world-model-interview", label: "World Model Interview" },
  { value: "rl-post-training-interview", label: "RL Post-training Interview" },
  { value: "paper-specific", label: "Paper-specific Quiz" },
  { value: "random-drill", label: "Random Drill" }
];

type QuizQuestion = {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  options: string | null;
  answer: string;
  explanation: string;
  scoringRubric: string;
  expectedInterviewAnswer: string;
  commonWrongAnswer: string;
  paperId: string | null;
  conceptId: string | null;
  nextReviewAt: string | null;
};

export function QuizArenaClient({ initialMode, initialPaperId }: { initialMode: string; initialPaperId?: string }) {
  const [mode, setMode] = useState(initialMode || "daily-review");
  const [paperId, setPaperId] = useState(initialPaperId ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<null | {
    isCorrect: boolean;
    expectedAnswer: string;
    explanation: string;
    scoringRubric: string;
    expectedInterviewAnswer: string;
    commonWrongAnswer: string;
    nextReviewAt: string;
    masteryScore: number;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = questions[index] ?? null;
  const options = useMemo(() => {
    if (!current?.options) return [];
    try {
      const parsed = JSON.parse(current.options);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }, [current?.options]);

  async function loadQuestions() {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswer("");
    try {
      const params = new URLSearchParams({ mode, limit: "20" });
      if (mode === "paper-specific" && paperId) params.set("paperId", paperId);

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load questions");
        return;
      }

      const data = await res.json();
      setQuestions(data);
      setIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function submit() {
    if (!current || !answer.trim()) return;

    const start = performance.now();

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: current.id,
          userAnswer: answer,
          confidence,
          timeSpentSeconds: Math.round((performance.now() - start) / 1000)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit answer");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    setResult(null);
    setAnswer("");
    setIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Mode</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[260px_1fr_180px_130px]">
          <Select value={mode} onChange={(event) => setMode(event.target.value)}>
            {MODES.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Input
            value={paperId}
            onChange={(event) => setPaperId(event.target.value)}
            placeholder="Paper ID (for paper-specific mode)"
          />
          <Select value={confidence} onChange={(event) => setConfidence(event.target.value as typeof confidence)}>
            <option value="low">Low confidence</option>
            <option value="medium">Medium confidence</option>
            <option value="high">High confidence</option>
          </Select>
          <Button variant="outline" onClick={loadQuestions} disabled={loading}>
            Reload
          </Button>
        </CardContent>
      </Card>

      {loading && !current ? (
        <Card>
          <CardContent className="py-10 text-sm text-slate-300">Loading questions...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-danger/40 bg-danger/10">
          <CardContent className="py-4 text-sm text-slate-200">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && !current ? (
        <Card>
          <CardContent className="py-10 text-sm text-slate-300">
            No questions found for this mode. Try `random-drill` or run `pnpm pipeline:daily`.
          </CardContent>
        </Card>
      ) : null}

      {current ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                <p className="mt-1 text-xs text-slate-400">{current.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <DifficultyBadge value={current.difficulty} />
                <Badge variant="muted">{current.nextReviewAt ? `Next ${current.nextReviewAt.slice(0, 10)}` : "New"}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-7 text-slate-100">{current.question}</p>

            {options.length > 0 ? (
              <div className="grid gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      answer === option[0]
                        ? "border-primary/45 bg-primary/15 text-slate-100"
                        : "border-white/20 bg-white/5 text-slate-300 hover:border-primary/35"
                    }`}
                    onClick={() => setAnswer(option[0])}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer" />
            )}

            <div className="flex gap-2">
              <Button onClick={submit} disabled={loading || !answer.trim()}>
                Submit Answer
              </Button>
              <Button variant="ghost" onClick={nextQuestion} disabled={index >= questions.length - 1}>
                Next Question
              </Button>
            </div>

            {result ? (
              <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4">
                <p className={`text-sm font-semibold ${result.isCorrect ? "text-emerald-300" : "text-rose-300"}`}>
                  {result.isCorrect ? "Correct" : "Needs Review"}
                </p>
                <p className="text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">Expected answer:</span> {result.expectedAnswer}
                </p>
                <p className="text-sm text-slate-300">{result.explanation}</p>
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Expected interview answer:</span>{" "}
                  {result.expectedInterviewAnswer}
                </p>
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Common wrong answer:</span> {result.commonWrongAnswer}
                </p>
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Rubric:</span> {result.scoringRubric}
                </p>
                <p className="text-xs text-slate-400">
                  Next review: {result.nextReviewAt.slice(0, 10)} · mastery {result.masteryScore.toFixed(1)}%
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
