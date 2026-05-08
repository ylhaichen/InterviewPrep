import { NextRequest, NextResponse } from "next/server";

import { listQuizQuestions } from "@/lib/services/quiz";

export async function GET(request: NextRequest) {
  try {
    const mode = (request.nextUrl.searchParams.get("mode") as Parameters<typeof listQuizQuestions>[0]) ||
      "daily-review";
    const paperId = request.nextUrl.searchParams.get("paperId") ?? undefined;
    const limitRaw = request.nextUrl.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : 15;

    const payload = await listQuizQuestions(mode, paperId, Number.isNaN(limit) ? 15 : limit);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list questions" },
      { status: 500 }
    );
  }
}
