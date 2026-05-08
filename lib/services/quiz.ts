import { and, asc, desc, eq, inArray, lte, or, sql } from "drizzle-orm";

import {
  concepts,
  paperConceptLinks,
  questions,
  questionReviewStates,
  reviewEvents
} from "@/db/schema";
import { db } from "@/lib/db/client";
import {
  computeReviewDecision,
  type ConfidenceLevel,
  type ReviewStateInput
} from "@/lib/review/scheduler";
import { createId } from "@/lib/utils/id";
import { parseJsonArray, toJson } from "@/lib/utils/json";
import { nowIso } from "@/lib/utils/time";
import type { QuizSubmitInput } from "@/lib/validation/schemas";

type QuizMode =
  | "daily-review"
  | "weak-concepts"
  | "vla-interview"
  | "world-model-interview"
  | "rl-post-training-interview"
  | "paper-specific"
  | "random-drill";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function overlapScore(a: string, b: string): number {
  const setA = new Set(normalizeText(a).split(" ").filter(Boolean));
  const setB = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let hit = 0;
  for (const token of setA) {
    if (setB.has(token)) hit += 1;
  }

  return hit / Math.max(setA.size, setB.size);
}

function evaluateAnswer(
  question: { answer: string; options: string | null; type: string },
  userAnswer: string
): boolean {
  const expected = normalizeText(question.answer);
  const actual = normalizeText(userAnswer);

  if (question.options) {
    return expected === actual;
  }

  if (expected === actual) return true;
  return overlapScore(expected, actual) >= 0.45;
}

export async function listQuizQuestions(mode: QuizMode, paperId?: string, limit = 15) {
  const now = nowIso();

  if (mode === "paper-specific" && paperId) {
    return db
      .select({
        id: questions.id,
        type: questions.type,
        question: questions.question,
        options: questions.options,
        answer: questions.answer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        tags: questions.tags,
        expectedInterviewAnswer: questions.expectedInterviewAnswer,
        commonWrongAnswer: questions.commonWrongAnswer,
        scoringRubric: questions.scoringRubric,
        conceptId: questions.conceptId,
        paperId: questions.paperId,
        nextReviewAt: questionReviewStates.nextReviewAt,
        masteryScore: questionReviewStates.masteryScore
      })
      .from(questions)
      .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
      .where(eq(questions.paperId, paperId))
      .orderBy(desc(questions.createdAt))
      .limit(limit);
  }

  if (mode === "daily-review") {
    return db
      .select({
        id: questions.id,
        type: questions.type,
        question: questions.question,
        options: questions.options,
        answer: questions.answer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        tags: questions.tags,
        expectedInterviewAnswer: questions.expectedInterviewAnswer,
        commonWrongAnswer: questions.commonWrongAnswer,
        scoringRubric: questions.scoringRubric,
        conceptId: questions.conceptId,
        paperId: questions.paperId,
        nextReviewAt: questionReviewStates.nextReviewAt,
        masteryScore: questionReviewStates.masteryScore
      })
      .from(questionReviewStates)
      .innerJoin(questions, eq(questionReviewStates.questionId, questions.id))
      .where(lte(questionReviewStates.nextReviewAt, now))
      .orderBy(asc(questionReviewStates.nextReviewAt))
      .limit(limit);
  }

  if (mode === "weak-concepts") {
    return db
      .select({
        id: questions.id,
        type: questions.type,
        question: questions.question,
        options: questions.options,
        answer: questions.answer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        tags: questions.tags,
        expectedInterviewAnswer: questions.expectedInterviewAnswer,
        commonWrongAnswer: questions.commonWrongAnswer,
        scoringRubric: questions.scoringRubric,
        conceptId: questions.conceptId,
        paperId: questions.paperId,
        nextReviewAt: questionReviewStates.nextReviewAt,
        masteryScore: questionReviewStates.masteryScore
      })
      .from(questions)
      .innerJoin(concepts, eq(questions.conceptId, concepts.id))
      .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
      .where(lte(concepts.masteryScore, 55))
      .orderBy(asc(concepts.masteryScore), desc(questions.createdAt))
      .limit(limit);
  }

  const modeTags: Record<Exclude<QuizMode, "daily-review" | "weak-concepts" | "paper-specific" | "random-drill">, string[]> = {
    "vla-interview": ["VLA", "Robotics", "Embodied Intelligence"],
    "world-model-interview": ["World Model", "World Action Model"],
    "rl-post-training-interview": ["RL Post-training", "GRPO", "PPO", "DPO"]
  };

  if (mode in modeTags) {
    const tags = modeTags[mode as keyof typeof modeTags];
    const conditions = tags.map((tag) => sql`${questions.tags} LIKE ${`%${tag}%`}`);

    return db
      .select({
        id: questions.id,
        type: questions.type,
        question: questions.question,
        options: questions.options,
        answer: questions.answer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        tags: questions.tags,
        expectedInterviewAnswer: questions.expectedInterviewAnswer,
        commonWrongAnswer: questions.commonWrongAnswer,
        scoringRubric: questions.scoringRubric,
        conceptId: questions.conceptId,
        paperId: questions.paperId,
        nextReviewAt: questionReviewStates.nextReviewAt,
        masteryScore: questionReviewStates.masteryScore
      })
      .from(questions)
      .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
      .where(or(...conditions))
      .orderBy(desc(questions.createdAt))
      .limit(limit);
  }

  return db
    .select({
      id: questions.id,
      type: questions.type,
      question: questions.question,
      options: questions.options,
      answer: questions.answer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      tags: questions.tags,
      expectedInterviewAnswer: questions.expectedInterviewAnswer,
      commonWrongAnswer: questions.commonWrongAnswer,
      scoringRubric: questions.scoringRubric,
      conceptId: questions.conceptId,
      paperId: questions.paperId,
      nextReviewAt: questionReviewStates.nextReviewAt,
      masteryScore: questionReviewStates.masteryScore
    })
    .from(questions)
    .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}

export async function submitQuizAnswer(input: QuizSubmitInput) {
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .limit(1);

  if (!question) {
    throw new Error("Question not found");
  }

  const [state] = await db
    .select()
    .from(questionReviewStates)
    .where(eq(questionReviewStates.questionId, question.id))
    .limit(1);

  const isCorrect = evaluateAnswer(question, input.userAnswer);

  const currentState: ReviewStateInput = {
    correctCount: state?.correctCount ?? 0,
    wrongCount: state?.wrongCount ?? 0,
    masteryScore: state?.masteryScore ?? 0
  };

  const decision = computeReviewDecision(currentState, isCorrect, input.confidence as ConfidenceLevel);
  const reviewedAt = nowIso();

  await db.insert(reviewEvents).values({
    id: createId("review"),
    questionId: question.id,
    userAnswer: input.userAnswer,
    isCorrect,
    confidence: input.confidence,
    timeSpentSeconds: input.timeSpentSeconds,
    reviewedAt,
    nextReviewAt: decision.nextReviewAt
  });

  await db
    .insert(questionReviewStates)
    .values({
      questionId: question.id,
      lastReviewedAt: reviewedAt,
      nextReviewAt: decision.nextReviewAt,
      difficulty: question.difficulty,
      confidence: input.confidence,
      correctCount: decision.correctCount,
      wrongCount: decision.wrongCount,
      masteryScore: decision.masteryScore,
      updatedAt: reviewedAt
    })
    .onConflictDoUpdate({
      target: questionReviewStates.questionId,
      set: {
        lastReviewedAt: reviewedAt,
        nextReviewAt: decision.nextReviewAt,
        confidence: input.confidence,
        correctCount: decision.correctCount,
        wrongCount: decision.wrongCount,
        masteryScore: decision.masteryScore,
        updatedAt: reviewedAt
      }
    });

  if (question.conceptId) {
    const conceptStates = await db
      .select({ mastery: questionReviewStates.masteryScore })
      .from(questionReviewStates)
      .innerJoin(questions, eq(questionReviewStates.questionId, questions.id))
      .where(eq(questions.conceptId, question.conceptId));

    const meanMastery =
      conceptStates.length === 0
        ? decision.masteryScore
        : conceptStates.reduce((acc, row) => acc + row.mastery, 0) / conceptStates.length;

    await db
      .update(concepts)
      .set({ masteryScore: Number(meanMastery.toFixed(2)), updatedAt: nowIso() })
      .where(eq(concepts.id, question.conceptId));
  }

  return {
    questionId: question.id,
    isCorrect,
    expectedAnswer: question.answer,
    explanation: question.explanation,
    scoringRubric: question.scoringRubric,
    commonWrongAnswer: question.commonWrongAnswer,
    expectedInterviewAnswer: question.expectedInterviewAnswer,
    nextReviewAt: decision.nextReviewAt,
    masteryScore: decision.masteryScore
  };
}

export async function questionStats() {
  const all = await db.select().from(questions);
  const states = await db.select().from(questionReviewStates);

  const due = states.filter((item) => (item.nextReviewAt ?? "") <= nowIso()).length;
  const mastery =
    states.length === 0
      ? 0
      : states.reduce((acc, item) => acc + item.masteryScore, 0) / states.length;

  return {
    totalQuestions: all.length,
    dueReviews: due,
    avgMastery: Number(mastery.toFixed(2))
  };
}

export function parseQuestionOptions(options: string | null): string[] {
  return parseJsonArray(options ?? "[]");
}

export async function getQuestionsForConceptIds(conceptIds: string[]) {
  if (conceptIds.length === 0) return [];
  return db.select().from(questions).where(inArray(questions.conceptId, conceptIds));
}

export async function getPaperLinkedQuestions(paperId: string) {
  const conceptRows = await db
    .select({ conceptId: paperConceptLinks.conceptId })
    .from(paperConceptLinks)
    .where(eq(paperConceptLinks.paperId, paperId));

  const ids = conceptRows.map((row) => row.conceptId);
  if (ids.length === 0) {
    return db.select().from(questions).where(eq(questions.paperId, paperId));
  }

  return db
    .select()
    .from(questions)
    .where(or(eq(questions.paperId, paperId), inArray(questions.conceptId, ids)));
}
