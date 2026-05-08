from __future__ import annotations

import json
import os
import random
import sqlite3
import string
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.getenv("DATABASE_URL", str(ROOT / "data" / "embodied-research.db")))


def now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def today_iso() -> str:
    return datetime.utcnow().date().isoformat()


def make_id(prefix: str) -> str:
    alpha = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"{prefix}_{int(datetime.utcnow().timestamp())}_{alpha}"


def connect_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def json_dumps(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False)


def json_loads(raw: str | None, default: Any) -> Any:
    if not raw:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


def relevance_score(text: str, keywords: list[str]) -> float:
    text_low = text.lower()
    hits = sum(1 for keyword in keywords if keyword.lower() in text_low)
    if not keywords:
        return 0.0
    return min(1.0, round(hits / len(keywords) + 0.05, 2))


def review_days(correct: bool, confidence: str, mastery: float, correct_count: int) -> int:
    if not correct:
        return 1
    if mastery >= 85 and correct_count >= 5:
        return 30
    if confidence == "low":
        return 3
    if confidence == "medium":
        return 7
    return 14


def next_review_iso(days: int) -> str:
    return (datetime.utcnow() + timedelta(days=days)).replace(microsecond=0).isoformat() + "Z"


DEFAULT_KEYWORDS = [
    "vision language action",
    "vla",
    "world model",
    "world action model",
    "diffusion policy",
    "action chunking",
    "grpo",
    "ppo",
    "dpo",
    "process reward model",
    "outcome reward model",
    "verifier model",
    "embodied intelligence",
]
