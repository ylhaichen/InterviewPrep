# Data Model

## Core Tables

- `papers`
- `paper_summaries`
- `concepts`
- `questions`
- `review_events`
- `concept_edges`
- `daily_briefings`
- `settings`

## Supporting Tables

- `paper_concept_links`
- `question_review_states`
- `learning_paths`
- `interview_prompts`

## Review Scheduling Fields

Stored in `question_review_states`:

- `last_reviewed_at`
- `next_review_at`
- `difficulty`
- `confidence`
- `correct_count`
- `wrong_count`
- `mastery_score`

## Relationship Highlights

- One paper -> one summary (`paper_summaries.paper_id` unique)
- Many-to-many paper <-> concept (`paper_concept_links`)
- Question optionally links to concept and/or paper
- Each question has one mutable review-state row + many immutable review events
- Knowledge graph edges are explicit (`concept_edges`) plus derived links
