import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const papers = sqliteTable("papers", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  abstract: text("abstract").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  pdfUrl: text("pdf_url"),
  publishedDate: text("published_date"),
  collectedDate: text("collected_date").notNull(),
  topicTags: text("topic_tags").notNull(),
  relevanceScore: real("relevance_score").notNull().default(0),
  readingPriority: text("reading_priority").notNull().default("Skim"),
  readingStatus: text("reading_status").notNull().default("unread"),
  summaryStatus: text("summary_status").notNull().default("pending"),
  oneLineContribution: text("one_line_contribution").notNull().default(""),
  whyItMatters: text("why_it_matters").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const paperSummaries = sqliteTable("paper_summaries", {
  id: text("id").primaryKey(),
  paperId: text("paper_id")
    .notNull()
    .unique()
    .references(() => papers.id, { onDelete: "cascade" }),
  tldr: text("tldr").notNull(),
  problem: text("problem").notNull(),
  motivation: text("motivation").notNull(),
  coreIdea: text("core_idea").notNull(),
  methodPipeline: text("method_pipeline").notNull(),
  architecture: text("architecture").notNull(),
  trainingObjective: text("training_objective").notNull(),
  datasets: text("datasets").notNull(),
  benchmarks: text("benchmarks").notNull(),
  mainResults: text("main_results").notNull(),
  limitations: text("limitations").notNull(),
  implementationNotes: text("implementation_notes").notNull(),
  interviewValue: text("interview_value").notNull(),
  extraStructured: text("extra_structured").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const concepts = sqliteTable("concepts", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  aliases: text("aliases").notNull().default("[]"),
  domain: text("domain").notNull(),
  difficulty: text("difficulty").notNull(),
  shortDefinition: text("short_definition").notNull(),
  deepExplanation: text("deep_explanation").notNull(),
  whyItMatters: text("why_it_matters").notNull(),
  minimalExample: text("minimal_example").notNull(),
  mathNotes: text("math_notes"),
  commonConfusions: text("common_confusions").notNull().default("[]"),
  interviewQuestions: text("interview_questions").notNull().default("[]"),
  masteryScore: real("mastery_score").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const paperConceptLinks = sqliteTable("paper_concept_links", {
  id: text("id").primaryKey(),
  paperId: text("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  conceptId: text("concept_id")
    .notNull()
    .references(() => concepts.id, { onDelete: "cascade" }),
  strength: real("strength").notNull().default(0.5),
  createdAt: text("created_at").notNull()
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  conceptId: text("concept_id").references(() => concepts.id, { onDelete: "set null" }),
  paperId: text("paper_id").references(() => papers.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  question: text("question").notNull(),
  options: text("options"),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull(),
  tags: text("tags").notNull().default("[]"),
  expectedInterviewAnswer: text("expected_interview_answer").notNull(),
  commonWrongAnswer: text("common_wrong_answer").notNull(),
  scoringRubric: text("scoring_rubric").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const questionReviewStates = sqliteTable("question_review_states", {
  questionId: text("question_id")
    .primaryKey()
    .references(() => questions.id, { onDelete: "cascade" }),
  lastReviewedAt: text("last_reviewed_at"),
  nextReviewAt: text("next_review_at"),
  difficulty: text("difficulty").notNull().default("intermediate"),
  confidence: text("confidence").notNull().default("medium"),
  correctCount: integer("correct_count").notNull().default(0),
  wrongCount: integer("wrong_count").notNull().default(0),
  masteryScore: real("mastery_score").notNull().default(0),
  updatedAt: text("updated_at").notNull()
});

export const reviewEvents = sqliteTable("review_events", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  userAnswer: text("user_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  confidence: text("confidence").notNull(),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  reviewedAt: text("reviewed_at").notNull(),
  nextReviewAt: text("next_review_at").notNull()
});

export const conceptEdges = sqliteTable("concept_edges", {
  id: text("id").primaryKey(),
  sourceNodeId: text("source_node_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  sourceNodeType: text("source_node_type").notNull(),
  targetNodeType: text("target_node_type").notNull(),
  relationType: text("relation_type").notNull(),
  evidence: text("evidence").notNull(),
  paperId: text("paper_id").references(() => papers.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull()
});

export const dailyBriefings = sqliteTable("daily_briefings", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(),
  topPapers: text("top_papers").notNull().default("[]"),
  reviewQueue: text("review_queue").notNull().default("[]"),
  weakConcepts: text("weak_concepts").notNull().default("[]"),
  recommendedQuestions: text("recommended_questions").notNull().default("[]"),
  briefingText: text("briefing_text").notNull(),
  createdAt: text("created_at").notNull()
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  paperSources: text("paper_sources").notNull().default("[]"),
  searchKeywords: text("search_keywords").notNull().default("[]"),
  dailyPaperLimit: integer("daily_paper_limit").notNull().default(10),
  llmModel: text("llm_model").notNull().default("gpt-4.1-mini"),
  reviewRules: text("review_rules").notNull().default("{}"),
  exportSettings: text("export_settings").notNull().default("{}"),
  theme: text("theme").notNull().default("neural-lab"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const learningPaths = sqliteTable("learning_paths", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull(),
  progress: real("progress").notNull().default(0),
  masteryScore: real("mastery_score").notNull().default(0),
  conceptIds: text("concept_ids").notNull().default("[]"),
  paperIds: text("paper_ids").notNull().default("[]"),
  questionIds: text("question_ids").notNull().default("[]")
});

export const interviewPrompts = sqliteTable("interview_prompts", {
  id: text("id").primaryKey(),
  mode: text("mode").notNull(),
  question: text("question").notNull(),
  expectedAnswer: text("expected_answer").notNull(),
  followUps: text("follow_ups").notNull().default("[]"),
  commonWrongAnswers: text("common_wrong_answers").notNull().default("[]"),
  scoringRubric: text("scoring_rubric").notNull(),
  relatedConceptIds: text("related_concept_ids").notNull().default("[]"),
  relatedPaperIds: text("related_paper_ids").notNull().default("[]")
});

export const papersRelations = relations(papers, ({ one, many }) => ({
  summary: one(paperSummaries, {
    fields: [papers.id],
    references: [paperSummaries.paperId]
  }),
  links: many(paperConceptLinks),
  questions: many(questions)
}));

export const conceptsRelations = relations(concepts, ({ many }) => ({
  links: many(paperConceptLinks),
  questions: many(questions)
}));

export const paperConceptLinksRelations = relations(paperConceptLinks, ({ one }) => ({
  paper: one(papers, {
    fields: [paperConceptLinks.paperId],
    references: [papers.id]
  }),
  concept: one(concepts, {
    fields: [paperConceptLinks.conceptId],
    references: [concepts.id]
  })
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  concept: one(concepts, {
    fields: [questions.conceptId],
    references: [concepts.id]
  }),
  paper: one(papers, {
    fields: [questions.paperId],
    references: [papers.id]
  }),
  reviewEvents: many(reviewEvents),
  reviewState: one(questionReviewStates, {
    fields: [questions.id],
    references: [questionReviewStates.questionId]
  })
}));

export const reviewEventsRelations = relations(reviewEvents, ({ one }) => ({
  question: one(questions, {
    fields: [reviewEvents.questionId],
    references: [questions.id]
  })
}));

export type Paper = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;
export type PaperSummary = typeof paperSummaries.$inferSelect;
export type Concept = typeof concepts.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type ReviewEvent = typeof reviewEvents.$inferSelect;
export type QuestionReviewState = typeof questionReviewStates.$inferSelect;
export type ConceptEdge = typeof conceptEdges.$inferSelect;
export type DailyBriefing = typeof dailyBriefings.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InterviewPrompt = typeof interviewPrompts.$inferSelect;
