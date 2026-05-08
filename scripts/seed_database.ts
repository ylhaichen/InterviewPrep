import { eq } from "drizzle-orm";

import { concepts, interviewPrompts, learningPaths, papers, questions } from "../db/schema";
import { db } from "../lib/db/client";
import { collectCandidatePapers, updateDailyBriefing } from "../lib/services/ingest";
import { getSettings } from "../lib/services/settings";
import { createId } from "../lib/utils/id";
import { toJson } from "../lib/utils/json";

async function seedLearningPaths() {
  const existing = await db.select().from(learningPaths).limit(1);
  if (existing.length > 0) return;

  const payload = [
    {
      title: "Robotics Action Basics",
      description: "Control primitives, delta pose, action representation, and receding horizon execution.",
      orderIndex: 1
    },
    {
      title: "Imitation Learning",
      description: "Behavior cloning foundations, dataset design, and policy regularization.",
      orderIndex: 2
    },
    {
      title: "Diffusion Policy",
      description: "Denoising-based policy learning, action chunking, and latency tradeoffs.",
      orderIndex: 3
    },
    {
      title: "VLA Architecture",
      description: "Multimodal fusion, action tokenization, and instruction-conditioned control.",
      orderIndex: 4
    },
    {
      title: "World Models",
      description: "Latent dynamics, planning with imagination rollouts, and model bias mitigation.",
      orderIndex: 5
    },
    {
      title: "World Action Models",
      description: "Action-conditioned latent simulation for embodied planning and transfer.",
      orderIndex: 6
    },
    {
      title: "RL Post-training for Reasoning LLMs",
      description: "PPO, DPO, GRPO, PRM/ORM, verifier design, and reward hacking analysis.",
      orderIndex: 7
    },
    {
      title: "Embodied Intelligence Research Synthesis",
      description: "Unify data, policy, world model, and evaluation into interview-ready system arguments.",
      orderIndex: 8
    }
  ];

  for (const item of payload) {
    await db.insert(learningPaths).values({
      id: createId("path"),
      title: item.title,
      description: item.description,
      orderIndex: item.orderIndex,
      progress: 0,
      masteryScore: 0,
      conceptIds: "[]",
      paperIds: "[]",
      questionIds: "[]"
    });
  }
}

async function seedInterviewPrompts() {
  const existing = await db.select().from(interviewPrompts).limit(1);
  if (existing.length > 0) return;

  const prompts = [
    {
      mode: "Mock Interview",
      question:
        "Design a VLA policy that maps image + instruction + robot state to low-level control actions for a pick-and-place robot.",
      expectedAnswer:
        "A strong design includes multimodal encoders, temporal action head with chunking, receding-horizon control, and clear training objective with behavior cloning plus optional RL fine-tuning.",
      followUps: [
        "How do you control latency in real deployment?",
        "How do you evaluate OOD instruction robustness?"
      ],
      commonWrongAnswers: [
        "Only describing model layers without control loop",
        "Ignoring safety and failure recovery"
      ],
      scoringRubric: "5 points architecture, 3 points training, 2 points evaluation/failure analysis"
    },
    {
      mode: "Rapid Fire",
      question:
        "Compare DPO and PPO for reasoning LLM post-training in one minute with tradeoffs.",
      expectedAnswer:
        "DPO is simpler and offline preference-driven; PPO supports online exploration but is more complex and sensitive to reward calibration and KL control.",
      followUps: [
        "Where does GRPO fit relative to DPO/PPO?",
        "What are verifier-related failure modes?"
      ],
      commonWrongAnswers: ["Claiming DPO always dominates PPO"],
      scoringRubric: "2 points objective, 2 points data/compute tradeoff, 1 point failure mode"
    },
    {
      mode: "System Design",
      question:
        "Design a daily research pipeline turning raw papers into interview-ready drills.",
      expectedAnswer:
        "Pipeline should cover source scouting, ranking, parsing, structured summarization, concept graph update, question generation, spaced review update, and dashboard briefing.",
      followUps: [
        "What schema tables are critical?",
        "How do you validate generated questions?"
      ],
      commonWrongAnswers: ["Providing only UI steps without data pipeline"],
      scoringRubric: "4 points data model, 3 points pipeline, 3 points evaluation loop"
    }
  ];

  for (const prompt of prompts) {
    await db.insert(interviewPrompts).values({
      id: createId("interview"),
      mode: prompt.mode,
      question: prompt.question,
      expectedAnswer: prompt.expectedAnswer,
      followUps: toJson(prompt.followUps),
      commonWrongAnswers: toJson(prompt.commonWrongAnswers),
      scoringRubric: prompt.scoringRubric,
      relatedConceptIds: "[]",
      relatedPaperIds: "[]"
    });
  }
}

async function hydrateLearningPaths() {
  const conceptsRows = await db.select().from(concepts);
  const papersRows = await db.select().from(papers);
  const questionsRows = await db.select().from(questions);

  const pathRows = await db.select().from(learningPaths);

  for (const path of pathRows) {
    const title = path.title.toLowerCase();
    const conceptIds = conceptsRows
      .filter((concept) =>
        `${concept.name} ${concept.domain}`.toLowerCase().includes(title.includes("rl") ? "rl" : title.split(" ")[0])
      )
      .map((concept) => concept.id)
      .slice(0, 6);

    const paperIds = papersRows
      .filter((paper) => paper.title.toLowerCase().includes(title.split(" ")[0]))
      .map((paper) => paper.id)
      .slice(0, 6);

    const questionIds = questionsRows
      .filter((question) => conceptIds.includes(question.conceptId ?? ""))
      .map((question) => question.id)
      .slice(0, 12);

    const progress = questionIds.length === 0 ? 0 : Math.min(100, Math.round((questionIds.length / 12) * 100));
    const masteryCandidates = conceptsRows.filter((concept) => conceptIds.includes(concept.id));
    const masteryScore =
      masteryCandidates.length === 0
        ? 0
        : masteryCandidates.reduce((acc, concept) => acc + concept.masteryScore, 0) /
          masteryCandidates.length;

    await db
      .update(learningPaths)
      .set({
        conceptIds: toJson(conceptIds),
        paperIds: toJson(paperIds),
        questionIds: toJson(questionIds),
        progress,
        masteryScore: Number(masteryScore.toFixed(2))
      })
      .where(eq(learningPaths.id, path.id));
  }
}

async function main() {
  await getSettings();
  const result = await collectCandidatePapers();
  await seedLearningPaths();
  await seedInterviewPrompts();
  await hydrateLearningPaths();
  await updateDailyBriefing();

  console.log(`Seed complete. Inserted papers: ${result.inserted}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
