import { desc, eq, sql } from "drizzle-orm";

import { interviewPrompts } from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseJsonArray } from "@/lib/utils/json";

export async function listInterviewPrompts(mode?: string) {
  const rows = await db
    .select()
    .from(interviewPrompts)
    .where(mode ? eq(interviewPrompts.mode, mode) : undefined)
    .orderBy(mode ? desc(interviewPrompts.id) : sql`RANDOM()`)
    .limit(20);

  return rows.map((row) => ({
    ...row,
    followUps: parseJsonArray(row.followUps),
    commonWrongAnswers: parseJsonArray(row.commonWrongAnswers),
    relatedConceptIds: parseJsonArray(row.relatedConceptIds),
    relatedPaperIds: parseJsonArray(row.relatedPaperIds)
  }));
}

function overlapScore(expected: string, actual: string): number {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const a = new Set(normalize(expected).split(" ").filter(Boolean));
  const b = new Set(normalize(actual).split(" ").filter(Boolean));

  if (a.size === 0 || b.size === 0) return 0;

  let hit = 0;
  for (const token of b) {
    if (a.has(token)) hit += 1;
  }

  return hit / Math.max(a.size, b.size);
}

export async function evaluateInterviewAnswer(promptId: string, answer: string) {
  const [prompt] = await db
    .select()
    .from(interviewPrompts)
    .where(eq(interviewPrompts.id, promptId))
    .limit(1);

  if (!prompt) {
    throw new Error("Prompt not found");
  }

  const score = overlapScore(prompt.expectedAnswer, answer);

  return {
    score: Number((score * 100).toFixed(1)),
    expectedAnswer: prompt.expectedAnswer,
    followUps: parseJsonArray(prompt.followUps),
    rubric: prompt.scoringRubric,
    commonWrongAnswers: parseJsonArray(prompt.commonWrongAnswers)
  };
}
