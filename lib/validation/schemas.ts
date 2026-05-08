import { z } from "zod";

export const PaperImportSchema = z.object({
  title: z.string().min(5),
  authors: z.array(z.string().min(2)).min(1),
  abstract: z.string().min(40),
  source: z.enum([
    "arxiv",
    "semantic_scholar",
    "lab_blog",
    "github",
    "huggingface",
    "manual",
    "other"
  ]),
  sourceUrl: z.string().url(),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  publishedDate: z.string().optional(),
  topicTags: z.array(z.string()).min(1),
  relevanceScore: z.number().min(0).max(1).default(0.5),
  readingPriority: z.enum(["Must Read", "Skim", "Archive"]).default("Skim"),
  oneLineContribution: z.string().min(8),
  whyItMatters: z.string().min(8)
});

export const QuizSubmitSchema = z.object({
  questionId: z.string().min(5),
  userAnswer: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  timeSpentSeconds: z.number().int().min(0).max(36000)
});

export const SettingsUpdateSchema = z.object({
  paperSources: z.array(z.string()).min(1),
  searchKeywords: z.array(z.string()).min(1),
  dailyPaperLimit: z.number().int().min(1).max(100),
  llmModel: z.string().min(2),
  reviewRules: z.object({
    wrongDays: z.number().int().min(1),
    lowConfidenceDays: z.number().int().min(1),
    mediumConfidenceDays: z.number().int().min(1),
    highConfidenceDays: z.number().int().min(1),
    masteredDays: z.number().int().min(1)
  }),
  exportSettings: z.object({
    format: z.enum(["json", "csv", "xlsx", "docx"]),
    includeExplanations: z.boolean()
  }),
  theme: z.enum(["neural-lab", "oceanic-grid", "classic-dark"])
});

export const PaperFilterSchema = z.object({
  search: z.string().optional(),
  topic: z.string().optional(),
  priority: z.enum(["Must Read", "Skim", "Archive"]).optional(),
  status: z.enum(["unread", "reading", "reviewed", "archived"]).optional()
});

export type PaperImportInput = z.infer<typeof PaperImportSchema>;
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>;
export type SettingsUpdateInput = z.infer<typeof SettingsUpdateSchema>;
