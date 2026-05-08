# Embodied Research OS

Production-quality personal research and interview-preparation web app for:

- VLA
- World Models
- World Action Models
- RL post-training for reasoning LLMs
- Embodied Intelligence

Core loop:

`Paper -> Concept -> Question -> Review -> Interview Readiness`

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style reusable UI primitives
- Framer Motion
- React Flow
- Recharts
- SQLite (local-first, Postgres migration-ready schema)
- Drizzle ORM
- Zod validation
- Python pipeline scripts for ingestion/parsing/generation
- Vitest + Playwright

## Features

- Real persisted schema for papers, summaries, concepts, questions, review events, edges, briefing, settings.
- Paper Radar with search/filter and manual import.
- Paper Reader with structured summary + linked concepts + generated questions.
- Concept Atlas + Concept Detail with mastery and quiz history context.
- Quiz Arena with scoring, explanation, rubric, confidence capture.
- Spaced-review scheduler updates next review + mastery after each answer.
- Interactive Knowledge Graph over paper/concept/question relations.
- Interview Mode with follow-up prompts and score comparison.
- Learning Roadmap with progress and mastery tracking.
- Settings page for source/rules/theme/export knobs.
- Seed data and executable pipeline scripts.

## Quick Start

### 1) Install

If you use `pnpm`:

```bash
pnpm install
```

If `pnpm` is unavailable, use `npm`:

```bash
npm install
```

### 2) Initialize DB and seed data

```bash
npm run setup
```

### 3) Run app

```bash
npm run dev
```

Open: `http://127.0.0.1:3000`

One-command local bootstrap + run:

```bash
npm run local
```

## Commands

### App lifecycle

```bash
npm run dev
npm run build
npm run start
```

### Database

```bash
npm run db:init
npm run db:seed
```

### Pipelines

```bash
npm run papers:collect
npm run papers:parse
npm run papers:summaries
npm run papers:concepts
npm run papers:quiz
npm run papers:embeddings
npm run pipeline:daily
```

### Tests

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test
```

Playwright browser install (first time):

```bash
npx playwright install chromium
```

## Data Pipeline Behavior

`papers:collect` (or `pipeline:daily`) triggers:

1. Candidate paper collection + dedup
2. Relevance ranking + priority tagging
3. Structured summary generation
4. Concept extraction + graph links
5. Quiz generation + review-state initialization

## Required Pages

Implemented pages:

- `/` Home Dashboard
- `/papers` Paper Radar
- `/papers/[id]` Paper Reader
- `/concepts` Concept Atlas
- `/concepts/[id]` Concept Detail
- `/graph` Knowledge Graph
- `/quiz` Quiz Arena
- `/interview` Interview Mode
- `/roadmap` Learning Roadmap
- `/settings` Settings

## Agent Rules

- Root `AGENTS.md` is included.
- Repo-local domain skills are included under `skills/*/SKILL.md`.
- Future agents must read local Next.js docs under `node_modules/next/dist/docs/` before writing Next.js code.

## Schema & Architecture Docs

- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`

## Postgres Migration Path

- Schema is already normalized and relation-driven.
- Drizzle schema is centralized in `db/schema.ts`.
- To migrate, switch Drizzle dialect/driver and run migrations against Postgres.
- Keep JSON-array fields as JSONB in Postgres and add index strategy (`GIN`/btree) for query hotspots.
