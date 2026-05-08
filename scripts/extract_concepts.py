#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass

from pipeline_common import connect_db, json_dumps, json_loads, make_id, now_iso


@dataclass
class ConceptTemplate:
    name: str
    domain: str
    difficulty: str
    short_definition: str
    deep_explanation: str
    why_it_matters: str


CONCEPTS = [
    ConceptTemplate(
        "Action Chunking",
        "VLA",
        "intermediate",
        "Predict a short sequence of actions per inference step.",
        "Action Chunking improves temporal coherence and reduces compounding one-step control error.",
        "Core mechanism in modern robot policies and common interview question.",
    ),
    ConceptTemplate(
        "Diffusion Policy",
        "VLA",
        "advanced",
        "A policy that denoises noisy action trajectories conditioned on observations.",
        "Diffusion Policy captures multimodal action distributions and often pairs with chunked execution.",
        "Useful for discussing robust behavior cloning and inference latency tradeoffs.",
    ),
    ConceptTemplate(
        "World Model",
        "World Model",
        "advanced",
        "A learned latent dynamics model for planning and policy learning.",
        "World Models support imagination rollouts and sample-efficient control.",
        "Foundational for long-horizon embodied reasoning and planning interviews.",
    ),
    ConceptTemplate(
        "World Action Model",
        "World Model",
        "research-level",
        "Action-grounded latent world dynamics for embodied planning.",
        "World Action Models encode actionable transitions and bridge simulation to execution.",
        "Key topic for forward-looking foundation robotics interviews.",
    ),
    ConceptTemplate(
        "GRPO",
        "RL Post-training",
        "advanced",
        "Group-relative policy optimization for reasoning trajectories.",
        "GRPO leverages relative ranking signals to stabilize RL post-training.",
        "Frequently discussed in current reasoning LLM training systems.",
    ),
    ConceptTemplate(
        "PPO",
        "RL Post-training",
        "intermediate",
        "Clipped policy optimization objective for stable updates.",
        "PPO constrains policy shift and remains central in RLHF-style training.",
        "Essential baseline for post-training comparisons.",
    ),
    ConceptTemplate(
        "DPO",
        "RL Post-training",
        "advanced",
        "Direct preference optimization without explicit RL rollouts.",
        "DPO uses chosen/rejected pairs relative to a reference policy.",
        "Strong baseline for alignment and interview contrast with PPO/GRPO.",
    ),
    ConceptTemplate(
        "Process Reward Model",
        "RL Post-training",
        "research-level",
        "Reward model scoring intermediate reasoning steps.",
        "PRM improves credit assignment and reduces outcome-only blind spots.",
        "Critical topic for robust reasoning pipeline design.",
    ),
]


def pick_concepts(text: str) -> list[ConceptTemplate]:
    lower = text.lower()
    chosen = []
    for concept in CONCEPTS:
        key = concept.name.lower()
        if key in lower or key.replace(" ", "") in lower:
            chosen.append(concept)
    if not chosen:
        if "world" in lower:
            chosen.extend([c for c in CONCEPTS if c.name in {"World Model", "World Action Model"}])
        elif any(k in lower for k in ["grpo", "ppo", "dpo", "reward"]):
            chosen.extend([c for c in CONCEPTS if c.domain == "RL Post-training"][:3])
        else:
            chosen.extend(CONCEPTS[:3])
    return chosen[:4]


def upsert_concept(cur, concept: ConceptTemplate) -> str:
    existing = cur.execute("SELECT id FROM concepts WHERE name = ?", (concept.name,)).fetchone()
    now = now_iso()
    if existing:
        cur.execute(
            """
            UPDATE concepts
            SET domain = ?, difficulty = ?, short_definition = ?, deep_explanation = ?,
                why_it_matters = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                concept.domain,
                concept.difficulty,
                concept.short_definition,
                concept.deep_explanation,
                concept.why_it_matters,
                now,
                existing["id"],
            ),
        )
        return existing["id"]

    concept_id = make_id("concept_py")
    cur.execute(
        """
        INSERT INTO concepts (
          id, name, aliases, domain, difficulty, short_definition,
          deep_explanation, why_it_matters, minimal_example, math_notes,
          common_confusions, interview_questions, mastery_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            concept_id,
            concept.name,
            "[]",
            concept.domain,
            concept.difficulty,
            concept.short_definition,
            concept.deep_explanation,
            concept.why_it_matters,
            "Minimal runnable example should include observation, policy output, and evaluation metric.",
            None,
            json_dumps(["Overly vague definition", "No tradeoff discussion"]),
            json_dumps([f"Explain {concept.name} with one real system example"]),
            0,
            now,
            now,
        ),
    )
    return concept_id


def main() -> None:
    conn = connect_db()
    cur = conn.cursor()

    papers = cur.execute(
        """
        SELECT p.id, p.title, p.abstract, p.topic_tags
        FROM papers p
        JOIN paper_summaries s ON s.paper_id = p.id
        """
    ).fetchall()

    links_created = 0
    for paper in papers:
        text = f"{paper['title']} {paper['abstract']} {' '.join(json_loads(paper['topic_tags'], []))}"
        for concept in pick_concepts(text):
            concept_id = upsert_concept(cur, concept)
            now = now_iso()

            cur.execute(
                """
                INSERT OR IGNORE INTO paper_concept_links (id, paper_id, concept_id, strength, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (make_id("pcl_py"), paper["id"], concept_id, 0.75, now),
            )

            edge_exists = cur.execute(
                """
                SELECT id FROM concept_edges
                WHERE source_node_id = ? AND target_node_id = ? AND relation_type = ? AND paper_id = ?
                LIMIT 1
                """,
                (paper["id"], concept_id, "introduced_by", paper["id"]),
            ).fetchone()

            if not edge_exists:
                cur.execute(
                    """
                    INSERT INTO concept_edges (
                      id, source_node_id, target_node_id,
                      source_node_type, target_node_type, relation_type,
                      evidence, paper_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        make_id("edge_py"),
                        paper["id"],
                        concept_id,
                        "Paper",
                        "Concept",
                        "introduced_by",
                        f"{concept.name} extracted from paper text",
                        paper["id"],
                        now,
                    ),
                )
                links_created += 1

    conn.commit()
    conn.close()
    print(f"[extract_concepts] linked concepts: {links_created}")


if __name__ == "__main__":
    main()
