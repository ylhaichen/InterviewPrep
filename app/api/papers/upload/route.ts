import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { importPaper } from "@/lib/services/papers";
import { processPaper } from "@/lib/services/ingest";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    const title = String(form.get("title") || file.name.replace(/\.pdf$/i, ""));
    const abstract = String(
      form.get("abstract") ||
        "Local PDF import. Please update abstract and metadata after upload for better concept/question quality."
    );
    const authorsRaw = String(form.get("authors") || "Unknown Author");
    const tagsRaw = String(form.get("topicTags") || "VLA");

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const outputDir = path.join(process.cwd(), "data", "pdfs");
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, safeName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(outputPath, bytes);

    const paperId = await importPaper({
      title,
      authors: authorsRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      abstract,
      source: "manual",
      sourceUrl: `https://local-upload/${safeName}`,
      pdfUrl: "",
      publishedDate: new Date().toISOString().slice(0, 10),
      topicTags: tagsRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      relevanceScore: 0.55,
      readingPriority: "Skim",
      oneLineContribution: "Imported from local PDF file",
      whyItMatters: "Manual local paper upload for immediate concept and quiz generation"
    });

    await processPaper(paperId);

    return NextResponse.json({ paperId, savedPdf: outputPath }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
