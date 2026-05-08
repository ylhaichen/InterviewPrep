import { and, asc, desc, eq, lte, sql } from "drizzle-orm";

import {
  concepts,
  dailyBriefings,
  interviewPrompts,
  paperConceptLinks,
  papers,
  questionReviewStates,
  questions,
  reviewEvents
} from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseJsonArray } from "@/lib/utils/json";
import { nowIso, todayIsoDate } from "@/lib/utils/time";

export async function getDashboardPayload() {
  const today = todayIsoDate();

  const todaysPapers = await db
    .select({
      id: papers.id,
      title: papers.title,
      relevanceScore: papers.relevanceScore,
      readingPriority: papers.readingPriority,
      topicTags: papers.topicTags,
      oneLineContribution: papers.oneLineContribution
    })
    .from(papers)
    .where(eq(papers.collectedDate, today))
    .orderBy(desc(papers.relevanceScore))
    .limit(8);

  const mustRead = await db
    .select({
      id: papers.id,
      title: papers.title,
      relevanceScore: papers.relevanceScore,
      whyItMatters: papers.whyItMatters,
      readingStatus: papers.readingStatus
    })
    .from(papers)
    .where(and(eq(papers.readingPriority, "Must Read"), eq(papers.readingStatus, "unread")))
    .orderBy(desc(papers.relevanceScore))
    .limit(6);

  const reviewQueue = await db
    .select({
      questionId: questions.id,
      question: questions.question,
      type: questions.type,
      conceptId: questions.conceptId,
      nextReviewAt: questionReviewStates.nextReviewAt,
      masteryScore: questionReviewStates.masteryScore
    })
    .from(questionReviewStates)
    .innerJoin(questions, eq(questionReviewStates.questionId, questions.id))
    .where(lte(questionReviewStates.nextReviewAt, nowIso()))
    .orderBy(asc(questionReviewStates.nextReviewAt))
    .limit(8);

  const weakConcepts = await db
    .select({
      id: concepts.id,
      name: concepts.name,
      domain: concepts.domain,
      masteryScore: concepts.masteryScore,
      difficulty: concepts.difficulty
    })
    .from(concepts)
    .orderBy(asc(concepts.masteryScore))
    .limit(8);

  const interviewDrill = await db
    .select()
    .from(interviewPrompts)
    .orderBy(sql`RANDOM()`)
    .limit(3);

  const topicHeatmapRaw = await db
    .select({ domain: concepts.domain, count: concepts.id })
    .from(concepts);

  const domainCounts = new Map<string, number>();
  for (const row of topicHeatmapRaw) {
    domainCounts.set(row.domain, (domainCounts.get(row.domain) ?? 0) + 1);
  }

  const topicHeatmap = Array.from(domainCounts.entries()).map(([domain, count]) => ({
    domain,
    count
  }));

  const progressRaw = await db
    .select({ reviewedAt: reviewEvents.reviewedAt, isCorrect: reviewEvents.isCorrect })
    .from(reviewEvents)
    .orderBy(desc(reviewEvents.reviewedAt))
    .limit(100);

  const progressByDay = new Map<string, { total: number; correct: number }>();
  for (const row of progressRaw) {
    const day = row.reviewedAt.slice(0, 10);
    const existing = progressByDay.get(day) ?? { total: 0, correct: 0 };
    existing.total += 1;
    if (row.isCorrect) existing.correct += 1;
    progressByDay.set(day, existing);
  }

  const progressSeries = Array.from(progressByDay.entries())
    .map(([date, stats]) => ({
      date,
      accuracy: stats.total === 0 ? 0 : Number(((stats.correct / stats.total) * 100).toFixed(1)),
      attempts: stats.total
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const graphPreview = await db
    .select({
      paperId: papers.id,
      conceptId: paperConceptLinks.conceptId
    })
    .from(paperConceptLinks)
    .innerJoin(papers, eq(paperConceptLinks.paperId, papers.id))
    .limit(30);

  const [briefing] = await db
    .select()
    .from(dailyBriefings)
    .where(eq(dailyBriefings.date, today))
    .limit(1);

  return {
    todaysPapers: todaysPapers.map((paper) => ({
      ...paper,
      topicTags: parseJsonArray(paper.topicTags)
    })),
    mustRead,
    reviewQueue,
    weakConcepts,
    interviewDrill: interviewDrill.map((prompt) => ({
      ...prompt,
      followUps: parseJsonArray(prompt.followUps),
      commonWrongAnswers: parseJsonArray(prompt.commonWrongAnswers)
    })),
    topicHeatmap,
    progressSeries,
    graphPreview,
    briefing: briefing
      ? {
          ...briefing,
          topPapers: parseJsonArray(briefing.topPapers),
          reviewQueue: parseJsonArray(briefing.reviewQueue),
          weakConcepts: parseJsonArray(briefing.weakConcepts),
          recommendedQuestions: parseJsonArray(briefing.recommendedQuestions)
        }
      : null
  };
}
