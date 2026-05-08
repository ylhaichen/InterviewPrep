import { NextRequest, NextResponse } from "next/server";

import { collectCandidatePapers } from "@/lib/services/ingest";

export async function POST(_request: NextRequest) {
  try {
    const payload = await collectCandidatePapers();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run ingestion" },
      { status: 500 }
    );
  }
}
