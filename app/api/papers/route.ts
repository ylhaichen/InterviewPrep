import { NextRequest, NextResponse } from "next/server";

import { importPaper, listPapers } from "@/lib/services/papers";
import { processPaper } from "@/lib/services/ingest";
import { PaperFilterSchema, PaperImportSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const parsed = PaperFilterSchema.safeParse({
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      topic: request.nextUrl.searchParams.get("topic") ?? undefined,
      priority: request.nextUrl.searchParams.get("priority") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = await listPapers(parsed.data);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list papers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PaperImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const paperId = await importPaper(parsed.data);
    await processPaper(paperId);

    return NextResponse.json({ paperId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import paper" },
      { status: 500 }
    );
  }
}
