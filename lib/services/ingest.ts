import fs from "node:fs/promises";
import path from "node:path";

import { and, desc, eq } from "drizzle-orm";

import {
  conceptEdges,
  concepts,
  dailyBriefings,
  paperConceptLinks,
  papers,
  paperSummaries,
  questionReviewStates,
  questions
} from "@/db/schema";
import { db } from "@/lib/db/client";
import { CONCEPT_LIBRARY, PIPELINE_KEYWORDS, type ConceptTemplate } from "@/lib/pipeline/templates";
import { createId } from "@/lib/utils/id";
import { toJson } from "@/lib/utils/json";
import { nowIso, todayIsoDate } from "@/lib/utils/time";

type CandidatePaper = {
  title: string;
  authors: string[];
  abstract: string;
  source: string;
  source_url: string;
  pdf_url: string | null;
  published_date: string | null;
  collected_date: string;
  topic_tags: string[];
  raw_relevance_notes: string;
};

function textScore(text: string, keywords: string[]): number {
  const target = text.toLowerCase();
  let hit = 0;
  for (const keyword of keywords) {
    if (target.includes(keyword.toLowerCase())) {
      hit += 1;
    }
  }
  return keywords.length === 0 ? 0 : hit / keywords.length;
}

function computeRelevance(paper: CandidatePaper): number {
  const combined = `${paper.title} ${paper.abstract} ${paper.topic_tags.join(" ")}`;
  const base = textScore(combined, [...PIPELINE_KEYWORDS]);
  const noveltyBoost = paper.published_date && paper.published_date >= "2024-01-01" ? 0.08 : 0;
  const sourceBoost = ["arxiv", "semantic_scholar"].includes(paper.source) ? 0.05 : 0;
  return Number(Math.min(1, base + noveltyBoost + sourceBoost).toFixed(2));
}

function decidePriority(score: number): "Must Read" | "Skim" | "Archive" {
  if (score >= 0.68) return "Must Read";
  if (score >= 0.42) return "Skim";
  return "Archive";
}

function chooseConceptTemplates(paper: CandidatePaper): ConceptTemplate[] {
  const text = `${paper.title} ${paper.abstract} ${paper.topic_tags.join(" ")}`.toLowerCase();

  const matched = CONCEPT_LIBRARY.filter((template) => {
    const keys = [template.name, ...template.aliases].map((value) => value.toLowerCase());
    return keys.some((key) => text.includes(key));
  });

  if (matched.length > 0) return matched.slice(0, 4);

  if (text.includes("world")) {
    return CONCEPT_LIBRARY.filter((template) =>
      ["World Model", "World Action Model"].includes(template.name)
    );
  }

  if (text.includes("grpo") || text.includes("ppo") || text.includes("dpo")) {
    return CONCEPT_LIBRARY.filter((template) => template.domain === "RL Post-training").slice(0, 4);
  }

  return CONCEPT_LIBRARY.slice(0, 3);
}

function generateSummary(paper: CandidatePaper) {
  const tags = paper.topic_tags.join(", ");

  return {
    tldr: `${paper.title} proposes a practical step toward ${tags} with clear interview value for embodied AI prep.`,
    problem:
      "Current embodied and reasoning systems struggle to unify perception, action, and robust post-training signals under real-world constraints.",
    motivation:
      "Interview preparation requires extracting reusable concepts, implementation details, and failure-aware reasoning from each paper.",
    coreIdea:
      `The paper focuses on ${paper.topic_tags[0] ?? "embodied learning"} and translates theory into actionable training and evaluation decisions.`,
    methodPipeline:
      "Collect multimodal trajectories, encode observations, predict action or reasoning trajectory, optimize with imitation/RL objective, then evaluate on held-out tasks.",
    architecture:
      "Vision encoder + language/context encoder + policy/dynamics head with temporal aggregation and controllable decoding.",
    trainingObjective:
      "Combination of behavior cloning, policy optimization, or preference-based objective depending on task supervision.",
    datasets:
      "Mixture of robotics trajectories, synthetic rollouts, and benchmark-aligned evaluation sets.",
    benchmarks:
      "Task success rate, generalization under distribution shift, robustness to perturbation, and reasoning alignment metrics.",
    mainResults:
      "Demonstrates stronger generalization and more stable control/reasoning compared with naive baselines.",
    limitations:
      "Performance remains sensitive to data quality, annotation signal, and deployment latency constraints.",
    implementationNotes:
      "Start with a compact baseline, isolate data preprocessing, and benchmark latency before scaling model size.",
    interviewValue:
      "High: covers method design tradeoffs, failure analysis, and practical deployment constraints that appear frequently in interviews.",
    extraStructured: {
      observationSpace: "RGB image + proprioceptive state + optional text instruction",
      actionSpace: "Continuous end-effector delta pose / gripper action or token-level reasoning action",
      actionChunkingStrategy: "Predict horizon chunks with receding-horizon execution",
      controlFrequency: "10-20Hz typical real-robot setting",
      failureModes: [
        "OOD instructions",
        "Perception-action delay mismatch",
        "Reward mis-specification"
      ]
    }
  };
}

function generateQuestions(
  paperId: string,
  conceptId: string,
  conceptName: string,
  paperTitle: string
) {
  const baseQuestion = `Explain ${conceptName} and discuss why it matters for ${paperTitle}.`;

  return [
    {
      id: createId("q"),
      conceptId,
      paperId,
      type: "Explanation",
      question: baseQuestion,
      options: null,
      answer: `${conceptName} is a core mechanism that improves robustness and transfer when designing embodied or reasoning policies.`,
      explanation:
        "Strong answers define the mechanism, connect it to this paper's contribution, and discuss practical tradeoffs.",
      difficulty: "intermediate",
      tags: ["Explanation", conceptName],
      expectedInterviewAnswer:
        "Define concept, show where used in method, discuss impact on sample efficiency/robustness, mention failure modes.",
      commonWrongAnswer: "Only giving a dictionary definition without linking to method or tradeoff.",
      scoringRubric:
        "4/4 definition + paper linkage + tradeoff + failure mode; 2/4 partial linkage; 0/4 vague statement."
    },
    {
      id: createId("q"),
      conceptId,
      paperId,
      type: "Multiple Choice",
      question: `Which design choice best represents ${conceptName} usage in modern embodied systems?`,
      options: [
        "A. Fixed random action without feedback",
        "B. Per-step independent classifier without temporal context",
        "C. Structured action/reasoning prediction with feedback-aware optimization",
        "D. Purely rule-based scripted policy"
      ],
      answer: "C",
      explanation:
        "Modern systems rely on structured prediction and feedback loops, not static scripted or context-free controllers.",
      difficulty: "basic",
      tags: ["Multiple Choice", conceptName],
      expectedInterviewAnswer: "Option C with rationale about temporal structure and optimization objective.",
      commonWrongAnswer: "Choosing B and ignoring temporal context.",
      scoringRubric: "1/1 correct option with one-sentence rationale."
    },
    {
      id: createId("q"),
      conceptId,
      paperId,
      type: "Failure Analysis",
      question: `Diagnose one failure mode when ${conceptName} is misconfigured in ${paperTitle}.`,
      options: null,
      answer:
        "A common failure is distribution shift causing poor action/reasoning calibration, which can be mitigated by better replay coverage and uncertainty-aware selection.",
      explanation:
        "Interviewers expect concrete failure symptom + root cause + mitigation.",
      difficulty: "advanced",
      tags: ["Failure Analysis", conceptName],
      expectedInterviewAnswer:
        "State the failure symptom, identify root cause in model/data loop, propose an engineering mitigation.",
      commonWrongAnswer: "Saying only 'it overfits' without mechanism.",
      scoringRubric: "4/4 symptom + cause + mitigation + metric; 2/4 incomplete chain."
    }
  ];
}

async function upsertConcept(template: ConceptTemplate) {
  const now = nowIso();
  const [existing] = await db.select().from(concepts).where(eq(concepts.name, template.name)).limit(1);

  if (existing) {
    await db
      .update(concepts)
      .set({
        aliases: toJson(template.aliases),
        shortDefinition: template.shortDefinition,
        deepExplanation: template.deepExplanation,
        whyItMatters: template.whyItMatters,
        minimalExample: template.minimalExample,
        mathNotes: template.mathNotes ?? null,
        commonConfusions: toJson(template.commonConfusions),
        interviewQuestions: toJson(template.interviewQuestions),
        updatedAt: now
      })
      .where(eq(concepts.id, existing.id));

    return existing.id;
  }

  const id = createId("concept");
  await db.insert(concepts).values({
    id,
    name: template.name,
    aliases: toJson(template.aliases),
    domain: template.domain,
    difficulty: template.difficulty,
    shortDefinition: template.shortDefinition,
    deepExplanation: template.deepExplanation,
    whyItMatters: template.whyItMatters,
    minimalExample: template.minimalExample,
    mathNotes: template.mathNotes ?? null,
    commonConfusions: toJson(template.commonConfusions),
    interviewQuestions: toJson(template.interviewQuestions),
    masteryScore: 0,
    createdAt: now,
    updatedAt: now
  });

  return id;
}

async function linkPaperConcept(paperId: string, conceptId: string, evidence: string) {
  const now = nowIso();

  await db
    .insert(paperConceptLinks)
    .values({
      id: createId("pcl"),
      paperId,
      conceptId,
      strength: 0.78,
      createdAt: now
    })
    .onConflictDoNothing();

  await db.insert(conceptEdges).values({
    id: createId("edge"),
    sourceNodeId: paperId,
    targetNodeId: conceptId,
    sourceNodeType: "Paper",
    targetNodeType: "Concept",
    relationType: "introduced_by",
    evidence,
    paperId,
    createdAt: now
  });
}

async function upsertPaperSummary(paperId: string, summary: ReturnType<typeof generateSummary>) {
  const now = nowIso();
  const [existing] = await db
    .select()
    .from(paperSummaries)
    .where(eq(paperSummaries.paperId, paperId))
    .limit(1);

  if (existing) {
    await db
      .update(paperSummaries)
      .set({
        ...summary,
        extraStructured: toJson(summary.extraStructured),
        updatedAt: now
      })
      .where(eq(paperSummaries.paperId, paperId));
  } else {
    await db.insert(paperSummaries).values({
      id: createId("summary"),
      paperId,
      ...summary,
      extraStructured: toJson(summary.extraStructured),
      createdAt: now,
      updatedAt: now
    });
  }

  await db
    .update(papers)
    .set({ summaryStatus: "ready", updatedAt: now })
    .where(eq(papers.id, paperId));
}

async function upsertQuestions(questionRows: ReturnType<typeof generateQuestions>) {
  const now = nowIso();

  for (const item of questionRows) {
    await db.insert(questions).values({
      id: item.id,
      conceptId: item.conceptId,
      paperId: item.paperId,
      type: item.type,
      question: item.question,
      options: item.options ? toJson(item.options) : null,
      answer: item.answer,
      explanation: item.explanation,
      difficulty: item.difficulty,
      tags: toJson(item.tags),
      expectedInterviewAnswer: item.expectedInterviewAnswer,
      commonWrongAnswer: item.commonWrongAnswer,
      scoringRubric: item.scoringRubric,
      createdAt: now,
      updatedAt: now
    });

    await db.insert(questionReviewStates).values({
      questionId: item.id,
      lastReviewedAt: null,
      nextReviewAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      difficulty: item.difficulty,
      confidence: "medium",
      correctCount: 0,
      wrongCount: 0,
      masteryScore: 0,
      updatedAt: now
    });

    await db.insert(conceptEdges).values({
      id: createId("edge"),
      sourceNodeId: item.conceptId,
      targetNodeId: item.id,
      sourceNodeType: "Concept",
      targetNodeType: "Question",
      relationType: "evaluated_on",
      evidence: "Question generated from concept card and paper summary",
      paperId: item.paperId,
      createdAt: now
    });
  }
}

export async function processPaper(paperId: string) {
  const [paper] = await db.select().from(papers).where(eq(papers.id, paperId)).limit(1);
  if (!paper) {
    throw new Error(`Paper ${paperId} not found`);
  }

  const candidatePaper: CandidatePaper = {
    title: paper.title,
    authors: JSON.parse(paper.authors) as string[],
    abstract: paper.abstract,
    source: paper.source,
    source_url: paper.sourceUrl,
    pdf_url: paper.pdfUrl,
    published_date: paper.publishedDate,
    collected_date: paper.collectedDate,
    topic_tags: JSON.parse(paper.topicTags) as string[],
    raw_relevance_notes: paper.whyItMatters
  };

  const summary = generateSummary(candidatePaper);
  await upsertPaperSummary(paperId, summary);

  const conceptTemplates = chooseConceptTemplates(candidatePaper);

  for (const template of conceptTemplates) {
    const conceptId = await upsertConcept(template);
    await linkPaperConcept(paperId, conceptId, `${template.name} appears in ${paper.title}`);

    const [already] = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.paperId, paperId), eq(questions.conceptId, conceptId)))
      .limit(1);

    if (!already) {
      const qs = generateQuestions(paperId, conceptId, template.name, paper.title);
      await upsertQuestions(qs);
    }
  }

  await updateDailyBriefing();
}

export async function collectCandidatePapers() {
  const filePath = path.join(process.cwd(), "data", "seed", "paper_candidates.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const candidates = JSON.parse(raw) as CandidatePaper[];

  let inserted = 0;

  for (const candidate of candidates) {
    const [exists] = await db
      .select({ id: papers.id })
      .from(papers)
      .where(eq(papers.title, candidate.title))
      .limit(1);

    if (exists) continue;

    const relevance = computeRelevance(candidate);
    const priority = decidePriority(relevance);
    const now = nowIso();

    const paperId = createId("paper");

    await db.insert(papers).values({
      id: paperId,
      title: candidate.title,
      authors: toJson(candidate.authors),
      abstract: candidate.abstract,
      source: candidate.source,
      sourceUrl: candidate.source_url,
      pdfUrl: candidate.pdf_url,
      publishedDate: candidate.published_date,
      collectedDate: candidate.collected_date || todayIsoDate(),
      topicTags: toJson(candidate.topic_tags),
      relevanceScore: relevance,
      readingPriority: priority,
      readingStatus: "unread",
      summaryStatus: "pending",
      oneLineContribution: candidate.raw_relevance_notes,
      whyItMatters: candidate.raw_relevance_notes,
      createdAt: now,
      updatedAt: now
    });

    inserted += 1;
    await processPaper(paperId);
  }

  await updateDailyBriefing();
  return { inserted };
}

export async function updateDailyBriefing() {
  const date = todayIsoDate();
  const now = nowIso();

  const topPapers = await db
    .select({ id: papers.id })
    .from(papers)
    .orderBy(desc(papers.relevanceScore))
    .limit(5);

  const dueQueue = await db
    .select({ questionId: questionReviewStates.questionId })
    .from(questionReviewStates)
    .orderBy(desc(questionReviewStates.updatedAt))
    .limit(8);

  const weakConcepts = await db
    .select({ id: concepts.id })
    .from(concepts)
    .orderBy(concepts.masteryScore)
    .limit(6);

  const recommendedQuestions = await db
    .select({ id: questions.id })
    .from(questions)
    .orderBy(desc(questions.createdAt))
    .limit(6);

  const briefingText = [
    "Today focus on high-relevance VLA and World Model papers, then drill weak concepts with spaced review.",
    "Prioritize one deep read from Must Read queue and complete at least 8 quiz reviews.",
    "Interview emphasis: explain design tradeoffs between Diffusion Policy, Action Chunking, and RL post-training objectives."
  ].join(" ");

  await db
    .insert(dailyBriefings)
    .values({
      id: createId("brief"),
      date,
      topPapers: toJson(topPapers.map((item) => item.id)),
      reviewQueue: toJson(dueQueue.map((item) => item.questionId)),
      weakConcepts: toJson(weakConcepts.map((item) => item.id)),
      recommendedQuestions: toJson(recommendedQuestions.map((item) => item.id)),
      briefingText,
      createdAt: now
    })
    .onConflictDoUpdate({
      target: dailyBriefings.date,
      set: {
        topPapers: toJson(topPapers.map((item) => item.id)),
        reviewQueue: toJson(dueQueue.map((item) => item.questionId)),
        weakConcepts: toJson(weakConcepts.map((item) => item.id)),
        recommendedQuestions: toJson(recommendedQuestions.map((item) => item.id)),
        briefingText,
        createdAt: now
      }
    });
}
