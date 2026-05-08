#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

from pipeline_common import (
    DEFAULT_KEYWORDS,
    ROOT,
    connect_db,
    json_dumps,
    make_id,
    now_iso,
    relevance_score,
    today_iso,
)


def decide_priority(score: float) -> str:
    if score >= 0.68:
        return "Must Read"
    if score >= 0.42:
        return "Skim"
    return "Archive"


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect candidate papers into Embodied Research OS")
    parser.add_argument("--run-all", action="store_true", help="Run summaries + concept + quiz pipelines")
    args = parser.parse_args()

    candidate_file = ROOT / "data" / "seed" / "paper_candidates.json"
    candidates = json.loads(candidate_file.read_text(encoding="utf-8"))

    conn = connect_db()
    cur = conn.cursor()

    inserted = 0
    for paper in candidates:
      existing = cur.execute("SELECT id FROM papers WHERE title = ?", (paper["title"],)).fetchone()
      if existing:
          continue

      text = f"{paper['title']} {paper['abstract']} {' '.join(paper['topic_tags'])}"
      score = relevance_score(text, DEFAULT_KEYWORDS)
      now = now_iso()
      cur.execute(
          """
          INSERT INTO papers (
            id, title, authors, abstract, source, source_url, pdf_url, published_date,
            collected_date, topic_tags, relevance_score, reading_priority, reading_status,
            summary_status, one_line_contribution, why_it_matters, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          """,
          (
              f"paper_py_{inserted}_{int(score * 1000)}",
              paper["title"],
              json_dumps(paper["authors"]),
              paper["abstract"],
              paper["source"],
              paper["source_url"],
              paper["pdf_url"],
              paper["published_date"],
              paper.get("collected_date") or today_iso(),
              json_dumps(paper["topic_tags"]),
              score,
              decide_priority(score),
              "unread",
              "pending",
              paper["raw_relevance_notes"],
              paper["raw_relevance_notes"],
              now,
              now,
          ),
      )
      inserted += 1

    conn.commit()

    # Maintain daily briefing payload from current DB state.
    top_papers = [
        row["id"]
        for row in cur.execute(
            "SELECT id FROM papers ORDER BY relevance_score DESC LIMIT 5"
        ).fetchall()
    ]
    review_queue = [
        row["question_id"]
        for row in cur.execute(
            "SELECT question_id FROM question_review_states ORDER BY updated_at DESC LIMIT 8"
        ).fetchall()
    ]
    weak_concepts = [
        row["id"]
        for row in cur.execute(
            "SELECT id FROM concepts ORDER BY mastery_score ASC LIMIT 6"
        ).fetchall()
    ]
    recommended_questions = [
        row["id"]
        for row in cur.execute(
            "SELECT id FROM questions ORDER BY created_at DESC LIMIT 8"
        ).fetchall()
    ]

    briefing_text = (
        "Today prioritize one Must Read paper, review weak concepts, and finish due quiz rounds "
        "to push interview readiness on VLA, World Models, and RL post-training."
    )

    cur.execute(
        """
        INSERT INTO daily_briefings (
          id, date, top_papers, review_queue, weak_concepts, recommended_questions, briefing_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          top_papers=excluded.top_papers,
          review_queue=excluded.review_queue,
          weak_concepts=excluded.weak_concepts,
          recommended_questions=excluded.recommended_questions,
          briefing_text=excluded.briefing_text,
          created_at=excluded.created_at
        """,
        (
            make_id("brief_py"),
            today_iso(),
            json_dumps(top_papers),
            json_dumps(review_queue),
            json_dumps(weak_concepts),
            json_dumps(recommended_questions),
            briefing_text,
            now_iso(),
        ),
    )

    conn.commit()
    conn.close()

    print(f"[collect_papers] Inserted {inserted} new papers")

    if args.run_all:
        for script in [
            "generate_summaries.py",
            "extract_concepts.py",
            "generate_quiz.py",
        ]:
            cmd = ["python3", str(Path(__file__).resolve().parent / script)]
            print(f"[collect_papers] running: {' '.join(cmd)}")
            subprocess.check_call(cmd)


if __name__ == "__main__":
    main()
