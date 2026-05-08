---
name: paper-to-implementation-mapper
description: Extract implementation-facing modules and pitfalls from paper summaries.
triggers:
  - map paper to implementation
  - reproduction plan
inputs:
  - paper summary
  - concept links
outputs:
  - module checklist
  - training/eval notes
  - pitfalls
---

# paper-to-implementation-mapper

## Task
Translate research summary into engineering execution plan.

## Instructions
1. Read `paper_summaries.implementationNotes` and structured fields.
2. Enumerate modules: data loader, model head, objective, scheduler, evaluator.
3. Capture pitfalls and minimum reproducible config.
4. Present as checklist for coding tasks.

## Scripts / References
- `components/papers/paper-reader-view.tsx` (implementation section)
- `lib/services/ingest.ts` summary generation

## Output Contract
Text checklist suitable for sprint tasks and interview explanation.
