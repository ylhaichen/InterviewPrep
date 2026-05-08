import { eq, inArray } from "drizzle-orm";

import { conceptEdges, concepts, paperConceptLinks, papers, questions } from "@/db/schema";
import { db } from "@/lib/db/client";
import { parseJsonArray } from "@/lib/utils/json";

interface GraphFilters {
  topic?: string;
  nodeType?: "Paper" | "Concept" | "Question" | "All";
}

export async function getKnowledgeGraph(filters: GraphFilters = {}) {
  const allPapers = await db.select().from(papers);
  const allConcepts = await db.select().from(concepts);
  const allQuestions = await db.select().from(questions);
  const links = await db.select().from(paperConceptLinks);
  const explicitEdges = await db.select().from(conceptEdges);

  const filteredPapers =
    filters.topic && filters.topic !== "All"
      ? allPapers.filter((paper) => parseJsonArray(paper.topicTags).includes(filters.topic as string))
      : allPapers;

  const paperSet = new Set(filteredPapers.map((paper) => paper.id));
  const filteredLinks = links.filter((link) => paperSet.has(link.paperId));

  const conceptSet = new Set(filteredLinks.map((link) => link.conceptId));
  const questionSet = new Set(
    allQuestions
      .filter((question) => question.paperId && paperSet.has(question.paperId))
      .map((question) => question.id)
  );

  const filteredConcepts = allConcepts.filter((concept) => conceptSet.has(concept.id));
  const filteredQuestions = allQuestions.filter(
    (question) => questionSet.has(question.id) || (question.conceptId && conceptSet.has(question.conceptId))
  );

  const nodes = [
    ...filteredPapers.map((paper, idx) => ({
      id: paper.id,
      type: "default",
      data: {
        label: paper.title,
        kind: "Paper",
        meta: `${paper.readingPriority} · ${paper.source}`
      },
      position: { x: 40 + (idx % 3) * 340, y: 40 + Math.floor(idx / 3) * 220 }
    })),
    ...filteredConcepts.map((concept, idx) => ({
      id: concept.id,
      type: "default",
      data: {
        label: concept.name,
        kind: "Concept",
        meta: `${concept.domain} · mastery ${concept.masteryScore.toFixed(1)}%`
      },
      position: { x: 180 + (idx % 4) * 300, y: 380 + Math.floor(idx / 4) * 180 }
    })),
    ...filteredQuestions.map((question, idx) => ({
      id: question.id,
      type: "default",
      data: {
        label: question.question,
        kind: "Question",
        meta: `${question.type} · ${question.difficulty}`
      },
      position: { x: 100 + (idx % 5) * 250, y: 760 + Math.floor(idx / 5) * 180 }
    }))
  ];

  const relationEdges = [
    ...filteredLinks.map((link) => ({
      id: `pc_${link.id}`,
      source: link.paperId,
      target: link.conceptId,
      label: `uses (${link.strength.toFixed(2)})`,
      data: {
        relation: "paper-to-concept",
        explanation: "Concept appears in this paper's method or evaluation."
      }
    })),
    ...filteredQuestions
      .filter((question) => question.conceptId)
      .map((question) => ({
        id: `cq_${question.id}`,
        source: question.conceptId as string,
        target: question.id,
        label: "evaluated by",
        data: {
          relation: "concept-to-question",
          explanation: "Question probes this concept in interview style."
        }
      })),
    ...filteredQuestions
      .filter((question) => question.paperId)
      .map((question) => ({
        id: `pq_${question.id}`,
        source: question.paperId as string,
        target: question.id,
        label: "question from paper",
        data: {
          relation: "paper-to-question",
          explanation: "Question generated from paper summary and contribution."
        }
      })),
    ...explicitEdges
      .filter((edge) =>
        [edge.sourceNodeId, edge.targetNodeId].every(
          (id) => nodes.some((node) => node.id === id)
        )
      )
      .map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.relationType,
        data: {
          relation: edge.relationType,
          explanation: edge.evidence
        }
      }))
  ];

  let filteredNodes = nodes;
  if (filters.nodeType && filters.nodeType !== "All") {
    filteredNodes = nodes.filter((node) => node.data.kind === filters.nodeType);
  }

  const nodeIds = new Set(filteredNodes.map((node) => node.id));
  const filteredEdges = relationEdges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    stats: {
      papers: filteredPapers.length,
      concepts: filteredConcepts.length,
      questions: filteredQuestions.length,
      edges: filteredEdges.length
    }
  };
}

export async function getConceptGraphNeighbors(conceptId: string) {
  const [concept] = await db.select().from(concepts).where(eq(concepts.id, conceptId)).limit(1);
  if (!concept) return null;

  const linkRows = await db
    .select()
    .from(paperConceptLinks)
    .where(eq(paperConceptLinks.conceptId, conceptId));

  const paperRows =
    linkRows.length > 0
      ? await db
          .select({ id: papers.id, title: papers.title })
          .from(papers)
          .where(inArray(papers.id, linkRows.map((item) => item.paperId)))
      : [];

  const questionRows = await db
    .select({ id: questions.id, question: questions.question })
    .from(questions)
    .where(eq(questions.conceptId, conceptId));

  return {
    concept,
    papers: paperRows,
    questions: questionRows
  };
}
