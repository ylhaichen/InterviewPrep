#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "data" / "pdfs"
OUT_DIR = ROOT / "data" / "papers"


def parse_single_pdf(path: Path) -> dict:
    result = {
        "file": str(path),
        "title": path.stem,
        "pages": 0,
        "sections": [],
        "excerpt": "",
        "status": "parsed",
    }

    try:
        from pypdf import PdfReader  # type: ignore

        reader = PdfReader(str(path))
        result["pages"] = len(reader.pages)
        snippets = []
        for page in reader.pages[:3]:
            text = page.extract_text() or ""
            snippets.append(text[:1200])
        excerpt = "\n".join(snippets).strip()
        result["excerpt"] = excerpt[:3000]
        result["sections"] = [
            "Title / Abstract",
            "Method",
            "Experiments",
            "Limitations",
        ]
    except Exception as exc:  # noqa: BLE001
        raw = path.read_bytes()
        result["status"] = "fallback"
        result["excerpt"] = f"PDF binary parsed in fallback mode. bytes={len(raw)} error={exc}"

    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse one or many PDFs")
    parser.add_argument("--file", type=str, default=None, help="Single PDF path")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = [Path(args.file)] if args.file else sorted(PDF_DIR.glob("*.pdf"))
    if not targets:
        print("[parse_pdf] no pdf files found under data/pdfs")
        return

    for pdf in targets:
        payload = parse_single_pdf(pdf)
        out_file = OUT_DIR / f"{pdf.stem}.json"
        out_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[parse_pdf] wrote {out_file}")


if __name__ == "__main__":
    main()
