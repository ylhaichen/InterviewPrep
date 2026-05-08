---
name: daily-briefing-writer
description: Produce daily briefing from top papers, weak concepts, and review queue.
triggers:
  - generate daily briefing
  - what should I study today
inputs:
  - ranked papers
  - due review queue
  - weak concepts
outputs:
  - DailyBriefing row
  - dashboard-ready briefing text
---

# daily-briefing-writer

## Task
Create focused daily plan from current knowledge base state.

## Instructions
1. Select top relevance papers.
2. Select due question queue and lowest mastery concepts.
3. Draft concise daily action plan.
4. Upsert `daily_briefings` for today.

## Scripts / References
- `lib/services/ingest.ts` -> `updateDailyBriefing`
- `components/dashboard/daily-briefing-panel.tsx`

## Output Contract
`daily_briefings` record with IDs and briefing text.
