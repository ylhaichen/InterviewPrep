---
name: concept-card-generator
description: Generate and update durable concept cards linked to papers and quiz flow.
triggers:
  - extract concepts
  - create concept cards
inputs:
  - paper summary
  - concept templates
outputs:
  - Concept records
  - paper-concept links
---

# concept-card-generator

## Task
Convert paper knowledge into reusable concept cards.

## Instructions
1. Match concept candidates from summary/title/topic tags.
2. Upsert concept cards with definition, deep explanation, why-it-matters, examples.
3. Link papers and concepts in `paper_concept_links`.
4. Add graph edges to `concept_edges`.

## Scripts / References
- `scripts/extract_concepts.py`
- `lib/services/ingest.ts` -> `chooseConceptTemplates`, `upsertConcept`, `linkPaperConcept`

## Output Contract
`concepts` rows + `paper_concept_links` rows + `concept_edges` rows.
