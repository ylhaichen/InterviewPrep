import { addDays } from "date-fns";

import { nowIso } from "@/lib/utils/time";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ReviewStateInput {
  correctCount: number;
  wrongCount: number;
  masteryScore: number;
}

export interface ReviewDecision {
  nextReviewAt: string;
  masteryScore: number;
  correctCount: number;
  wrongCount: number;
}

function calcMastery(correctCount: number, wrongCount: number): number {
  const total = correctCount + wrongCount;
  if (total === 0) return 0;
  const accuracy = correctCount / total;
  const volumeFactor = Math.min(1, total / 20);
  return Number((accuracy * 80 + volumeFactor * 20).toFixed(2));
}

function resolveDays(
  isCorrect: boolean,
  confidence: ConfidenceLevel,
  projectedMastery: number,
  projectedCorrectCount: number
): number {
  if (!isCorrect) return 1;
  if (projectedMastery >= 85 && projectedCorrectCount >= 5) return 30;
  if (confidence === "low") return 3;
  if (confidence === "medium") return 7;
  return 14;
}

export function computeReviewDecision(
  current: ReviewStateInput,
  isCorrect: boolean,
  confidence: ConfidenceLevel,
  now = new Date()
): ReviewDecision {
  const correctCount = current.correctCount + (isCorrect ? 1 : 0);
  const wrongCount = current.wrongCount + (isCorrect ? 0 : 1);
  const masteryScore = calcMastery(correctCount, wrongCount);
  const days = resolveDays(isCorrect, confidence, masteryScore, correctCount);
  const nextReviewAt = addDays(now, days).toISOString();

  return {
    nextReviewAt,
    masteryScore,
    correctCount,
    wrongCount
  };
}

export function defaultReviewState(): ReviewDecision {
  return {
    nextReviewAt: addDays(new Date(), 1).toISOString(),
    masteryScore: 0,
    correctCount: 0,
    wrongCount: 0
  };
}

export function currentReviewTimestamp(): string {
  return nowIso();
}
