---
name: paper-source-scout
description: Scout candidate papers from arXiv, Semantic Scholar, GitHub, lab pages, and curated seed feeds for embodied AI and reasoning RL post-training.
triggers:
  - collect papers
  - find latest VLA papers
  - build daily paper radar
inputs:
  - keyword list
  - source preference
  - daily paper limit
outputs:
  - normalized candidate paper records
  - relevance notes
---

# paper-source-scout

## Task
Collect candidate papers and normalize into the app schema.

## Instructions
1. Read keywords from `settings.searchKeywords`.
2. Load seed candidate feed from `data/seed/paper_candidates.json`.
3. Deduplicate by title and source URL.
4. Score relevance and set priority tags.
5. Persist records into `papers`.

## Scripts / References
- `scripts/collect_papers.py`
- `lib/services/ingest.ts` -> `collectCandidatePapers`

## Output Contract
JSON rows matching Paper ingest shape with source metadata, dates, tags, and relevance notes.
