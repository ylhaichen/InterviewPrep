import { NextRequest, NextResponse } from "next/server";

import { listConcepts } from "@/lib/services/concepts";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const domain = request.nextUrl.searchParams.get("domain") ?? undefined;
    const difficulty = request.nextUrl.searchParams.get("difficulty") ?? undefined;

    const payload = await listConcepts({ search, domain, difficulty });
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list concepts" },
      { status: 500 }
    );
  }
}
