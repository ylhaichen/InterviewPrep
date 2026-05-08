---
name: interview-mode-coach
description: Simulate interview rounds with follow-ups and scoring feedback.
triggers:
  - start mock interview
  - evaluate my interview answer
inputs:
  - prompt mode
  - candidate answer
outputs:
  - score
  - follow-up questions
  - rubric-guided feedback
---

# interview-mode-coach

## Task
Run structured interview practice loop.

## Instructions
1. Load prompts by mode from `interview_prompts`.
2. Present question and collect answer.
3. Compare answer overlap with expected answer.
4. Return score, follow-ups, rubric, and common wrong answers.

## Scripts / References
- `lib/services/interview.ts`
- `app/api/interview/route.ts`

## Output Contract
`{score, expectedAnswer, followUps, rubric, commonWrongAnswers}`
