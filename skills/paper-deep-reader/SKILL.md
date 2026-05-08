---
name: paper-deep-reader
description: Convert one paper into structured summary fields for learning and interview preparation.
triggers:
  - summarize paper
  - deep read this paper
inputs:
  - paper metadata
  - abstract or parsed PDF text
outputs:
  - PaperSummary record
---

# paper-deep-reader

## Task
Generate structured summary in database-backed schema.

## Instructions
1. Pull paper record from `papers`.
2. Extract structured sections: problem, motivation, method, objective, benchmarks, limitations.
3. Add implementation notes and interview value.
4. Persist to `paper_summaries` and set `papers.summaryStatus = ready`.

## Scripts / References
- `scripts/generate_summaries.py`
- `lib/services/ingest.ts` -> `generateSummary`, `upsertPaperSummary`

## Output Contract
One `paper_summaries` row linked by `paper_id`.
