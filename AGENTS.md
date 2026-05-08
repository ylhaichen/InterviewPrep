# AGENTS.md

You are maintaining **Embodied Research OS**.

## Mandatory First Step

Before writing any Next.js code, read local bundled Next.js docs under:

- `node_modules/next/dist/docs/`

Do not rely on outdated memory of Next.js behavior.

## Product Goal

Build and maintain a complete personal research and interview-preparation system for:

- VLA
- World Models
- World Action Models
- RL post-training for reasoning LLMs
- Embodied Intelligence

The core loop is mandatory:

`Paper -> Concept -> Question -> Review -> Interview Readiness`

## Architecture Rules

- Use Next.js App Router with strict TypeScript.
- Prefer Server Components; use Client Components only for interactive UI.
- Keep business logic in `lib/`, not in page files.
- Use real database-backed flows (SQLite now, migration-ready for Postgres).
- Every paper must connect to concept cards.
- Every concept must connect to questions.
- Every quiz answer must update spaced review and mastery.
- Do not ship non-functional UI placeholders for core features.
- Add/maintain tests for ingestion, quiz/review flow, graph, and navigation.

## UI Rules (from project brief)

- Dark neural robotics lab direction
- Premium research cockpit
- Glassmorphism + bento layout
- Cyan/violet accents
- Dense but readable technical layout
- Strong hover states + meaningful motion
- Beautiful empty/loading/error states

## Delivery Standards

- No fake dashboard-only implementation.
- No unresolved TODO for core loop.
- Keep scripts executable for collection, parsing, concept extraction, and quiz generation.
- Keep README and docs synchronized with actual commands and schema.
