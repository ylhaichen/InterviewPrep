#!/usr/bin/env python3
from __future__ import annotations

from pipeline_common import connect_db, json_dumps, make_id, next_review_iso, now_iso


def question_payload(concept_name: str, paper_title: str) -> list[dict]:
    return [
        {
            "type": "Explanation",
            "question": f"Explain {concept_name} and relate it to {paper_title}.",
            "options": None,
            "answer": f"{concept_name} should be explained with mechanism, tradeoff, and relevance to this paper's method.",
            "explanation": "Strong answer includes definition, pipeline role, and one failure mode.",
            "difficulty": "intermediate",
            "tags": ["Explanation", concept_name],
            "expected": "Definition + paper linkage + tradeoff + mitigation.",
            "wrong": "Only a textbook definition without system context.",
            "rubric": "4 points full chain, 2 points partial chain.",
        },
        {
            "type": "Multiple Choice",
            "question": f"Which option best reflects practical usage of {concept_name}?",
            "options": [
                "A. Random policy with no feedback",
                "B. One-step static classifier",
                "C. Structured prediction with feedback-aware update",
                "D. Purely manual rule script",
            ],
            "answer": "C",
            "explanation": "Practical systems require structured prediction with feedback, not static or random control.",
            "difficulty": "basic",
            "tags": ["Multiple Choice", concept_name],
            "expected": "Choose C and justify with temporal/coherence reasoning.",
            "wrong": "Choosing B while ignoring temporal context.",
            "rubric": "1 point correct option + rationale.",
        },
    ]


def main() -> None:
    conn = connect_db()
    cur = conn.cursor()

    links = cur.execute(
        """
        SELECT l.paper_id, l.concept_id, c.name AS concept_name, p.title AS paper_title
        FROM paper_concept_links l
        JOIN concepts c ON c.id = l.concept_id
        JOIN papers p ON p.id = l.paper_id
        """
    ).fetchall()

    inserted = 0
    for link in links:
        existing = cur.execute(
            "SELECT id FROM questions WHERE paper_id = ? AND concept_id = ? LIMIT 1",
            (link["paper_id"], link["concept_id"]),
        ).fetchone()
        if existing:
            continue

        for question in question_payload(link["concept_name"], link["paper_title"]):
            qid = make_id("q_py")
            now = now_iso()
            cur.execute(
                """
                INSERT INTO questions (
                  id, concept_id, paper_id, type, question, options, answer,
                  explanation, difficulty, tags, expected_interview_answer,
                  common_wrong_answer, scoring_rubric, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    qid,
                    link["concept_id"],
                    link["paper_id"],
                    question["type"],
                    question["question"],
                    json_dumps(question["options"]) if question["options"] else None,
                    question["answer"],
                    question["explanation"],
                    question["difficulty"],
                    json_dumps(question["tags"]),
                    question["expected"],
                    question["wrong"],
                    question["rubric"],
                    now,
                    now,
                ),
            )

            cur.execute(
                """
                INSERT OR REPLACE INTO question_review_states (
                  question_id, last_reviewed_at, next_review_at, difficulty,
                  confidence, correct_count, wrong_count, mastery_score, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    qid,
                    None,
                    next_review_iso(1),
                    question["difficulty"],
                    "medium",
                    0,
                    0,
                    0,
                    now,
                ),
            )

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
                    link["concept_id"],
                    qid,
                    "Concept",
                    "Question",
                    "evaluated_on",
                    "Quiz item generated from concept + paper link",
                    link["paper_id"],
                    now,
                ),
            )
            inserted += 1

    conn.commit()
    conn.close()
    print(f"[generate_quiz] generated {inserted} questions")


if __name__ == "__main__":
    main()
