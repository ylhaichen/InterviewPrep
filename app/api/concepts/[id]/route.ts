import { NextRequest, NextResponse } from "next/server";

import { getConceptById } from "@/lib/services/concepts";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getConceptById(id);

    if (!payload) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load concept" },
      { status: 500 }
    );
  }
}
