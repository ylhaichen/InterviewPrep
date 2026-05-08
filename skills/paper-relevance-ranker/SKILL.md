---
name: paper-relevance-ranker
description: Rank candidate papers for interview preparation focus areas and assign reading priorities.
triggers:
  - rank papers
  - prioritize reading list
inputs:
  - candidate papers
  - preparation focus domains
outputs:
  - relevance score
  - reading priority
  - ranked reason
---

# paper-relevance-ranker

## Task
Apply consistent scoring for VLA, World Model, RL post-training, and interview value.

## Instructions
1. Compute keyword/domain overlap from title + abstract + topic tags.
2. Apply recency and source quality boosts.
3. Map score to `Must Read | Skim | Archive`.
4. Save ranked values into `papers.relevanceScore` and `papers.readingPriority`.

## Scripts / References
- `lib/services/ingest.ts` -> `computeRelevance`, `decidePriority`
- `scripts/collect_papers.py`

## Output Contract
`{paper_id, relevance_score, reading_priority, reason, recommended_action}`
