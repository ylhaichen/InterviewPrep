---
name: quiz-generator
description: Generate interview-oriented explanation and multiple-choice questions from concepts and papers.
triggers:
  - generate quiz
  - create interview questions
inputs:
  - concept cards
  - linked papers
outputs:
  - Question rows
  - review-state initialization
---

# quiz-generator

## Task
Build question bank that is directly usable in Quiz Arena.

## Instructions
1. For each paper-concept link, generate explanation + MCQ + failure-analysis variants.
2. Save answer, explanation, expected interview answer, wrong answer pattern, rubric.
3. Initialize `question_review_states` with next-day due date.
4. Add concept-question edges.

## Scripts / References
- `scripts/generate_quiz.py`
- `lib/services/ingest.ts` -> `generateQuestions`, `upsertQuestions`

## Output Contract
`questions` rows + `question_review_states` rows + `concept_edges` rows.
