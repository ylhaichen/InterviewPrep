import { eq } from "drizzle-orm";

import { settings } from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseJsonArray, parseJsonObject, toJson } from "@/lib/utils/json";
import { nowIso } from "@/lib/utils/time";
import type { SettingsUpdateInput } from "@/lib/validation/schemas";

const DEFAULT_SETTINGS_ID = "default";

const DEFAULT_REVIEW_RULES = {
  wrongDays: 1,
  lowConfidenceDays: 3,
  mediumConfidenceDays: 7,
  highConfidenceDays: 14,
  masteredDays: 30
};

const DEFAULT_EXPORT_SETTINGS = {
  format: "json",
  includeExplanations: true
};

export async function getSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, DEFAULT_SETTINGS_ID)).limit(1);

  if (!row) {
    const now = nowIso();
    await db.insert(settings).values({
      id: DEFAULT_SETTINGS_ID,
      paperSources: toJson(["arxiv", "semantic_scholar", "github", "lab_blog"]),
      searchKeywords: toJson([
        "vision language action",
        "world model",
        "world action model",
        "diffusion policy",
        "GRPO",
        "PPO",
        "DPO",
        "process reward model",
        "embodied intelligence"
      ]),
      dailyPaperLimit: 10,
      llmModel: "gpt-4.1-mini",
      reviewRules: toJson(DEFAULT_REVIEW_RULES),
      exportSettings: toJson(DEFAULT_EXPORT_SETTINGS),
      theme: "neural-lab",
      createdAt: now,
      updatedAt: now
    });

    return getSettings();
  }

  return {
    ...row,
    paperSources: parseJsonArray(row.paperSources),
    searchKeywords: parseJsonArray(row.searchKeywords),
    reviewRules: parseJsonObject(row.reviewRules, DEFAULT_REVIEW_RULES),
    exportSettings: parseJsonObject(row.exportSettings, DEFAULT_EXPORT_SETTINGS)
  };
}

export async function updateSettings(input: SettingsUpdateInput) {
  const now = nowIso();

  await db
    .insert(settings)
    .values({
      id: DEFAULT_SETTINGS_ID,
      paperSources: toJson(input.paperSources),
      searchKeywords: toJson(input.searchKeywords),
      dailyPaperLimit: input.dailyPaperLimit,
      llmModel: input.llmModel,
      reviewRules: toJson(input.reviewRules),
      exportSettings: toJson(input.exportSettings),
      theme: input.theme,
      createdAt: now,
      updatedAt: now
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: {
        paperSources: toJson(input.paperSources),
        searchKeywords: toJson(input.searchKeywords),
        dailyPaperLimit: input.dailyPaperLimit,
        llmModel: input.llmModel,
        reviewRules: toJson(input.reviewRules),
        exportSettings: toJson(input.exportSettings),
        theme: input.theme,
        updatedAt: now
      }
    });

  return getSettings();
}
