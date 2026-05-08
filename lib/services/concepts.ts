import { and, asc, eq, like, or, sql } from "drizzle-orm";

import {
  conceptEdges,
  concepts,
  paperConceptLinks,
  papers,
  questions,
  questionReviewStates,
  reviewEvents
} from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseStringArray } from "@/lib/services/serializers";

interface ConceptFilters {
  search?: string;
  domain?: string;
  difficulty?: string;
}

export async function listConcepts(filters: ConceptFilters = {}) {
  const predicates = [];

  if (filters.search) {
    predicates.push(
      or(
        like(concepts.name, `%${filters.search}%`),
        sql`${concepts.aliases} LIKE ${`%${filters.search}%`}`
      )
    );
  }

  if (filters.domain) {
    predicates.push(eq(concepts.domain, filters.domain));
  }

  if (filters.difficulty) {
    predicates.push(eq(concepts.difficulty, filters.difficulty));
  }

  const rows = await db
    .select()
    .from(concepts)
    .where(predicates.length ? and(...predicates) : undefined)
    .orderBy(asc(concepts.name));

  return rows.map((row) => ({
    ...row,
    aliases: parseStringArray(row.aliases),
    commonConfusions: parseStringArray(row.commonConfusions),
    interviewQuestions: parseStringArray(row.interviewQuestions)
  }));
}

export async function getConceptById(id: string) {
  const [concept] = await db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
  if (!concept) return null;

  const relatedPapers = await db
    .select({
      id: papers.id,
      title: papers.title,
      relevanceScore: papers.relevanceScore,
      readingPriority: papers.readingPriority,
      source: papers.source,
      relationStrength: paperConceptLinks.strength
    })
    .from(paperConceptLinks)
    .innerJoin(papers, eq(paperConceptLinks.paperId, papers.id))
    .where(eq(paperConceptLinks.conceptId, id));

  const relatedQuestions = await db
    .select({
      id: questions.id,
      type: questions.type,
      question: questions.question,
      answer: questions.answer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      nextReviewAt: questionReviewStates.nextReviewAt,
      masteryScore: questionReviewStates.masteryScore
    })
    .from(questions)
    .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
    .where(eq(questions.conceptId, id));

  const reviewHistory = await db
    .select({
      id: reviewEvents.id,
      questionId: reviewEvents.questionId,
      isCorrect: reviewEvents.isCorrect,
      confidence: reviewEvents.confidence,
      reviewedAt: reviewEvents.reviewedAt,
      nextReviewAt: reviewEvents.nextReviewAt
    })
    .from(reviewEvents)
    .innerJoin(questions, eq(reviewEvents.questionId, questions.id))
    .where(eq(questions.conceptId, id));

  const edgeRows = await db
    .select()
    .from(conceptEdges)
    .where(or(eq(conceptEdges.sourceNodeId, id), eq(conceptEdges.targetNodeId, id)));

  return {
    ...concept,
    aliases: parseStringArray(concept.aliases),
    commonConfusions: parseStringArray(concept.commonConfusions),
    interviewQuestions: parseStringArray(concept.interviewQuestions),
    relatedPapers,
    relatedQuestions,
    reviewHistory,
    edges: edgeRows
  };
}
