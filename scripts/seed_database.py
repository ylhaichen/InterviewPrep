#!/usr/bin/env python3
from __future__ import annotations

import subprocess

from pipeline_common import connect_db, json_dumps, make_id, now_iso


def seed_settings(cur) -> None:
    exists = cur.execute("SELECT id FROM settings WHERE id = 'default'").fetchone()
    if exists:
        return

    now = now_iso()
    cur.execute(
        """
        INSERT INTO settings (
          id, paper_sources, search_keywords, daily_paper_limit, llm_model,
          review_rules, export_settings, theme, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "default",
            json_dumps(["arxiv", "semantic_scholar", "github", "lab_blog", "other"]),
            json_dumps(
                [
                    "vision language action",
                    "world model",
                    "world action model",
                    "diffusion policy",
                    "GRPO",
                    "PPO",
                    "DPO",
                    "process reward model",
                    "embodied intelligence",
                ]
            ),
            10,
            "gpt-4.1-mini",
            json_dumps(
                {
                    "wrongDays": 1,
                    "lowConfidenceDays": 3,
                    "mediumConfidenceDays": 7,
                    "highConfidenceDays": 14,
                    "masteredDays": 30,
                }
            ),
            json_dumps({"format": "json", "includeExplanations": True}),
            "neural-lab",
            now,
            now,
        ),
    )


def seed_learning_paths(cur) -> None:
    exists = cur.execute("SELECT id FROM learning_paths LIMIT 1").fetchone()
    if exists:
        return

    payload = [
        ("Robotics action basics", "Control primitives, action representation, and receding horizon."),
        ("Imitation learning", "Behavior cloning fundamentals and data quality discipline."),
        ("Diffusion Policy", "Action diffusion, chunking, and latency-aware deployment."),
        ("VLA architecture", "Multimodal encoding and policy heads."),
        ("World Models", "Latent dynamics and planning."),
        ("World Action Models", "Action-grounded world modeling for control."),
        ("RL post-training for reasoning LLMs", "PPO, DPO, GRPO, PRM/ORM, verifier design."),
        ("Embodied Intelligence synthesis", "Cross-paper integration into interview-ready narratives."),
    ]

    for idx, (title, description) in enumerate(payload, start=1):
        cur.execute(
            """
            INSERT INTO learning_paths (
              id, title, description, order_index, progress, mastery_score,
              concept_ids, paper_ids, question_ids
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (make_id("path_py"), title, description, idx, 0, 0, "[]", "[]", "[]"),
        )


def seed_interview_prompts(cur) -> None:
    exists = cur.execute("SELECT id FROM interview_prompts LIMIT 1").fetchone()
    if exists:
        return

    prompts = [
        (
            "Mock Interview",
            "Design a VLA policy from image + instruction + robot state to actions.",
            "Use multimodal encoders, temporal action head with chunking, receding horizon control, and clear training objectives.",
            ["How do you handle latency?", "How do you evaluate OOD robustness?"],
            ["Only listing layers without control loop", "Ignoring failure analysis"],
            "10 points: architecture(4), objective(3), evaluation(3)",
        ),
        (
            "Rapid Fire",
            "Compare DPO and PPO for reasoning post-training with one concrete tradeoff.",
            "DPO is simpler/offline; PPO supports online exploration but needs stable reward+KL control.",
            ["Where does GRPO fit?"],
            ["Claiming one method always dominates"],
            "5 points total: objective, data assumptions, failure mode",
        ),
    ]

    for mode, question, expected, follow_ups, wrong_answers, rubric in prompts:
        cur.execute(
            """
            INSERT INTO interview_prompts (
              id, mode, question, expected_answer, follow_ups, common_wrong_answers,
              scoring_rubric, related_concept_ids, related_paper_ids
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                make_id("interview_py"),
                mode,
                question,
                expected,
                json_dumps(follow_ups),
                json_dumps(wrong_answers),
                rubric,
                "[]",
                "[]",
            ),
        )


def hydrate_learning_paths(cur) -> None:
    paths = cur.execute("SELECT id, title FROM learning_paths ORDER BY order_index").fetchall()
    for path in paths:
        title = path["title"].lower()
        concept_rows = cur.execute(
            "SELECT id, mastery_score FROM concepts WHERE lower(name) LIKE ? OR lower(domain) LIKE ? LIMIT 8",
            (f"%{title.split()[0]}%", f"%{title.split()[0]}%"),
        ).fetchall()
        paper_rows = cur.execute(
            "SELECT id FROM papers WHERE lower(title) LIKE ? LIMIT 8", (f"%{title.split()[0]}%",)
        ).fetchall()

        concept_ids = [row["id"] for row in concept_rows]
        paper_ids = [row["id"] for row in paper_rows]

        if concept_ids:
            qmarks = ",".join(["?"] * len(concept_ids))
            question_rows = cur.execute(
                f"SELECT id FROM questions WHERE concept_id IN ({qmarks}) LIMIT 16", concept_ids
            ).fetchall()
        else:
            question_rows = []

        question_ids = [row["id"] for row in question_rows]
        mastery = (
            sum(float(row["mastery_score"]) for row in concept_rows) / len(concept_rows)
            if concept_rows
            else 0
        )
        progress = min(100, int(len(question_ids) / 12 * 100)) if question_ids else 0

        cur.execute(
            """
            UPDATE learning_paths
            SET concept_ids = ?, paper_ids = ?, question_ids = ?, progress = ?, mastery_score = ?
            WHERE id = ?
            """,
            (
                json_dumps(concept_ids),
                json_dumps(paper_ids),
                json_dumps(question_ids),
                progress,
                round(mastery, 2),
                path["id"],
            ),
        )


def dedupe_concept_edges(cur) -> None:
    cur.execute(
        """
        DELETE FROM concept_edges
        WHERE rowid NOT IN (
          SELECT MIN(rowid)
          FROM concept_edges
          GROUP BY
            source_node_id,
            target_node_id,
            source_node_type,
            target_node_type,
            relation_type,
            IFNULL(paper_id, '')
        )
        """
    )


def main() -> None:
    subprocess.check_call(["python3", "scripts/init_db.py"])
    subprocess.check_call(["python3", "scripts/collect_papers.py", "--run-all"])

    conn = connect_db()
    cur = conn.cursor()

    seed_settings(cur)
    seed_learning_paths(cur)
    seed_interview_prompts(cur)
    hydrate_learning_paths(cur)
    dedupe_concept_edges(cur)

    conn.commit()
    conn.close()

    print("[seed_database] seed complete")


if __name__ == "__main__":
    main()
