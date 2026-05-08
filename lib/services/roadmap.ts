import { asc } from "drizzle-orm";

import { learningPaths } from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseJsonArray } from "@/lib/utils/json";

export async function listLearningPaths() {
  const rows = await db.select().from(learningPaths).orderBy(asc(learningPaths.orderIndex));

  return rows.map((row) => ({
    ...row,
    conceptIds: parseJsonArray(row.conceptIds),
    paperIds: parseJsonArray(row.paperIds),
    questionIds: parseJsonArray(row.questionIds)
  }));
}
