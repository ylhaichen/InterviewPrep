import { and, desc, eq, inArray, like, sql } from "drizzle-orm";

import {
  concepts,
  paperConceptLinks,
  papers,
  paperSummaries,
  questions,
  questionReviewStates
} from "@/db/schema";
import { db } from "@/lib/db/client";
import type { PaperImportInput } from "@/lib/validation/schemas";
import { createId } from "@/lib/utils/id";
import { toJson } from "@/lib/utils/json";
import { nowIso, todayIsoDate } from "@/lib/utils/time";

interface PaperFilters {
  search?: string;
  topic?: string;
  priority?: "Must Read" | "Skim" | "Archive";
  status?: "unread" | "reading" | "reviewed" | "archived";
}

export async function listPapers(filters: PaperFilters = {}) {
  const predicates = [];

  if (filters.search) {
    predicates.push(like(papers.title, `%${filters.search}%`));
  }

  if (filters.topic) {
    predicates.push(sql`${papers.topicTags} LIKE ${`%${filters.topic}%`}`);
  }

  if (filters.priority) {
    predicates.push(eq(papers.readingPriority, filters.priority));
  }

  if (filters.status) {
    predicates.push(eq(papers.readingStatus, filters.status));
  }

  const rows = await db
    .select()
    .from(papers)
    .where(predicates.length ? and(...predicates) : undefined)
    .orderBy(desc(papers.relevanceScore), desc(papers.collectedDate));

  return rows.map((row) => ({
    ...row,
    authors: JSON.parse(row.authors) as string[],
    topicTags: JSON.parse(row.topicTags) as string[]
  }));
}

export async function getPaperById(id: string) {
  const [paper] = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  if (!paper) return null;

  const [summary] = await db
    .select()
    .from(paperSummaries)
    .where(eq(paperSummaries.paperId, id))
    .limit(1);

  const links = await db
    .select({
      id: paperConceptLinks.id,
      conceptId: concepts.id,
      name: concepts.name,
      domain: concepts.domain,
      difficulty: concepts.difficulty,
      strength: paperConceptLinks.strength
    })
    .from(paperConceptLinks)
    .innerJoin(concepts, eq(paperConceptLinks.conceptId, concepts.id))
    .where(eq(paperConceptLinks.paperId, id));

  const relatedQuestions = await db
    .select({
      id: questions.id,
      type: questions.type,
      question: questions.question,
      difficulty: questions.difficulty,
      conceptId: questions.conceptId,
      nextReviewAt: questionReviewStates.nextReviewAt
    })
    .from(questions)
    .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
    .where(eq(questions.paperId, id));

  return {
    ...paper,
    authors: JSON.parse(paper.authors) as string[],
    topicTags: JSON.parse(paper.topicTags) as string[],
    summary,
    linkedConcepts: links,
    relatedQuestions
  };
}

export async function importPaper(input: PaperImportInput) {
  const id = createId("paper");
  const now = nowIso();

  await db.insert(papers).values({
    id,
    title: input.title,
    authors: toJson(input.authors),
    abstract: input.abstract,
    source: input.source,
    sourceUrl: input.sourceUrl,
    pdfUrl: input.pdfUrl || null,
    publishedDate: input.publishedDate || null,
    collectedDate: todayIsoDate(),
    topicTags: toJson(input.topicTags),
    relevanceScore: input.relevanceScore,
    readingPriority: input.readingPriority,
    readingStatus: "unread",
    summaryStatus: "pending",
    oneLineContribution: input.oneLineContribution,
    whyItMatters: input.whyItMatters,
    createdAt: now,
    updatedAt: now
  });

  return id;
}

export async function getPapersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db.select().from(papers).where(inArray(papers.id, ids));
  return rows.map((row) => ({
    ...row,
    authors: JSON.parse(row.authors) as string[],
    topicTags: JSON.parse(row.topicTags) as string[]
  }));
}

export async function updatePaperReadingStatus(
  id: string,
  status: "unread" | "reading" | "reviewed" | "archived"
) {
  await db
    .update(papers)
    .set({
      readingStatus: status,
      updatedAt: nowIso()
    })
    .where(eq(papers.id, id));
}
