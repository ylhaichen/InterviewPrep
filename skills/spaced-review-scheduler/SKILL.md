---
name: spaced-review-scheduler
description: Update next review date and mastery score based on correctness and confidence.
triggers:
  - submit quiz answer
  - update review schedule
inputs:
  - question id
  - answer correctness
  - confidence
outputs:
  - ReviewEvent row
  - updated question review state
  - updated concept mastery
---

# spaced-review-scheduler

## Task
Maintain review cadence and mastery progression.

## Instructions
1. Read current state from `question_review_states`.
2. Apply rules: wrong=1d, low=3d, medium=7d, high=14d, mastery streak=30d.
3. Insert `review_events` record.
4. Upsert new state and recompute related concept mastery.

## Scripts / References
- `lib/review/scheduler.ts`
- `lib/services/quiz.ts` -> `submitQuizAnswer`

## Output Contract
Persisted review state and response payload for UI feedback.
