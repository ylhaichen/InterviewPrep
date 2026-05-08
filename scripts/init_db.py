#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from pipeline_common import ROOT, connect_db


def main() -> None:
    schema_file = ROOT / "scripts" / "schema.sql"
    sql = schema_file.read_text(encoding="utf-8")

    conn = connect_db()
    conn.executescript(sql)
    conn.commit()
    conn.close()

    print("[init_db] schema initialized")


if __name__ == "__main__":
    main()
