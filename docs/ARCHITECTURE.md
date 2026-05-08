# Architecture

## Layers

- `app/`: App Router pages + API route handlers.
- `components/`: reusable UI and domain panels.
- `lib/services/`: business logic and DB orchestration.
- `lib/review/`: spaced-review scheduling logic.
- `lib/pipeline/`: concept templates and ingest helpers.
- `db/schema.ts`: Drizzle table schema.
- `scripts/`: executable data pipelines.
- `skills/`: repo-local domain skill specs.

## Core Loop Mapping

1. Paper ingestion: `scripts/collect_papers.py`, `lib/services/ingest.ts`.
2. Structured summary: `scripts/generate_summaries.py`, `paper_summaries`.
3. Concept extraction: `scripts/extract_concepts.py`, `concepts`, `paper_concept_links`, `concept_edges`.
4. Question generation: `scripts/generate_quiz.py`, `questions`, `question_review_states`.
5. Review + mastery: `lib/services/quiz.ts`, `lib/review/scheduler.ts`, `review_events`.
6. Interview readiness: `/quiz`, `/interview`, `/roadmap`, dashboard metrics.

## API Endpoints

- `GET/POST /api/papers`
- `GET/PATCH /api/papers/[id]`
- `GET /api/concepts`
- `GET /api/concepts/[id]`
- `GET /api/questions`
- `GET /api/questions/[id]`
- `POST /api/review/submit`
- `POST /api/ingest`
- `GET/PUT /api/settings`
- `GET/POST /api/interview`
- `GET /api/dashboard`

## UI Direction

- Dark neural robotics lab
- Glassmorphism surfaces
- Bento layout
- Dense technical information hierarchy
- Cyan/violet accent system
