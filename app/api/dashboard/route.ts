import { NextResponse } from "next/server";

import { getDashboardPayload } from "@/lib/services/dashboard";

export async function GET() {
  try {
    const payload = await getDashboardPayload();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
