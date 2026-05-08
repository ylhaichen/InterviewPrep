import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { questions, questionReviewStates } from "@/db/schema";
import { db } from "@/lib/db/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [row] = await db
      .select({
        id: questions.id,
        conceptId: questions.conceptId,
        paperId: questions.paperId,
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
        nextReviewAt: questionReviewStates.nextReviewAt,
        masteryScore: questionReviewStates.masteryScore
      })
      .from(questions)
      .leftJoin(questionReviewStates, eq(questionReviewStates.questionId, questions.id))
      .where(eq(questions.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load question" },
      { status: 500 }
    );
  }
}
