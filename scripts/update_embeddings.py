#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pipeline_common import connect_db

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "data" / "exports" / "paper_embeddings.json"


def pseudo_embedding(text: str, dim: int = 24) -> list[float]:
    # Deterministic local embedding placeholder for keyword search fallback.
    values: list[float] = []
    for idx in range(dim):
        digest = hashlib.sha256(f"{idx}:{text}".encode("utf-8")).hexdigest()
        values.append(round(int(digest[:8], 16) / 0xFFFFFFFF, 6))
    return values


def main() -> None:
    conn = connect_db()
    cur = conn.cursor()

    papers = cur.execute("SELECT id, title, abstract, topic_tags FROM papers").fetchall()

    payload = []
    for paper in papers:
        text = f"{paper['title']} {paper['abstract']} {paper['topic_tags']}"
        payload.append(
            {
                "paper_id": paper["id"],
                "embedding": pseudo_embedding(text),
            }
        )

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    conn.close()

    print(f"[update_embeddings] wrote {len(payload)} vectors to {OUT_FILE}")


if __name__ == "__main__":
    main()
