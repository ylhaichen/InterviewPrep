import { NextRequest, NextResponse } from "next/server";

import { evaluateInterviewAnswer, listInterviewPrompts } from "@/lib/services/interview";

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") ?? undefined;
    const payload = await listInterviewPrompts(mode);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const promptId = body.promptId as string;
    const answer = body.answer as string;

    if (!promptId || !answer) {
      return NextResponse.json({ error: "promptId and answer required" }, { status: 400 });
    }

    const payload = await evaluateInterviewAnswer(promptId, answer);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
