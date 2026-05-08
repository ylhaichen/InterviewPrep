"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MODES = [
  "Mock Interview",
  "Rapid Fire",
  "Whiteboard Explanation",
  "System Design",
  "Paper Deep Dive",
  "Research Defense"
];

type Prompt = {
  id: string;
  mode: string;
  question: string;
  expectedAnswer: string;
  followUps: string[];
  commonWrongAnswers: string[];
  scoringRubric: string;
};

export function InterviewModeClient() {
  const [mode, setMode] = useState("Mock Interview");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | {
    score: number;
    expectedAnswer: string;
    followUps: string[];
    rubric: string;
    commonWrongAnswers: string[];
  }>(null);
  const [loading, setLoading] = useState(false);

  const current = prompts[idx] ?? null;

  async function loadPrompts() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/interview?mode=${encodeURIComponent(mode)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load prompts");
      setPrompts(data);
      setIdx(0);
    } catch (error) {
      console.error(error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function evaluate() {
    if (!current || !answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ promptId: current.id, answer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to evaluate");
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interview Practice Mode</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[260px_160px]">
          <Select value={mode} onChange={(event) => setMode(event.target.value)}>
            {MODES.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={loadPrompts} disabled={loading}>
            Refresh Questions
          </Button>
        </CardContent>
      </Card>

      {current ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{current.mode}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-xl border border-white/15 bg-white/5 p-4 text-base leading-7 text-slate-100">
              {current.question}
            </p>
            <Textarea
              placeholder="Write your interview answer here..."
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="min-h-[180px]"
            />
            <div className="flex gap-2">
              <Button onClick={evaluate} disabled={loading || !answer.trim()}>
                Evaluate Answer
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswer("");
                  setResult(null);
                  setIdx((prev) => (prev + 1) % Math.max(prompts.length, 1));
                }}
              >
                Next Prompt
              </Button>
            </div>

            {result ? (
              <div className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-cyan-200">Interview Score: {result.score.toFixed(1)} / 100</p>
                <p className="text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">Expected answer:</span> {result.expectedAnswer}
                </p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Follow-ups</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {result.followUps.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">Scoring rubric:</span> {result.rubric}
                </p>
                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">Common wrong answers:</span>{" "}
                  {result.commonWrongAnswers.join(" | ")}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-sm text-slate-300">No prompts available for this mode.</CardContent>
        </Card>
      )}
    </div>
  );
}
