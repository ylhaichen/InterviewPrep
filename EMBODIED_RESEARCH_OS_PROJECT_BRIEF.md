# Embodied Research OS — Coding Agent Full Build Brief

## 0. Mission

Build a fully usable, production-quality personal web application for preparing written tests and interviews in the following research areas:

- Vision-Language-Action models, abbreviated as VLA
- World Models
- World Action Models
- RL post-training for reasoning LLMs
- Embodied Intelligence
- Robot Foundation Models
- Diffusion Policy and action chunking
- Policy learning, imitation learning, RLHF, RLAIF, GRPO, DPO, PPO, PRM, ORM, verifier models

This project is not a generic paper list, blog, landing page, or static demo.

The final product must be a personal Research OS that automatically collects papers, parses papers, extracts concepts, builds a knowledge base, generates interview-style questions, schedules review, and presents everything in a beautiful modern web interface.

The core loop must be:

```text
Paper → Concept → Question → Review → Interview Readiness
```

The product must be usable from the first full build. Do not create a webpage that only looks good but has no working data model or working interaction.

---

## 1. Non-negotiable Requirements

### 1.1 Build standard

The coding agent must build from an empty repo and deliver a complete working application.

Do not split the task into stages, MVP, prototype, demo, or placeholder-only implementation.

The agent must implement the highest-standard architecture from the start:

- Real project structure
- Real data model
- Real paper ingestion logic
- Real PDF parsing pipeline
- Real concept extraction pipeline
- Real quiz generation pipeline
- Real review scheduling logic
- Real UI interactions
- Real search and filtering
- Real persistence layer
- Real error handling
- Real tests
- Real documentation

Mock data is allowed only as seed data for local development. It must not replace the real pipelines.

### 1.2 Product standard

The app must support daily use for research learning.

A paper must not remain only as metadata. Every processed paper should be converted into:

- A structured summary
- Related concepts
- Interview notes
- Generated questions
- Review items
- Knowledge graph links

A concept must not remain only as a dictionary definition. Every concept should include:

- Short definition
- Deep explanation
- Why it matters
- Minimal example
- Related papers
- Related concepts
- Common interview questions
- Common mistakes
- Quiz items

A quiz item must not be isolated. Every quiz item should connect back to:

- A concept
- A paper, when applicable
- A review schedule
- A mastery score

---

## 2. Recommended Tech Stack

Use the following stack unless there is a strong technical reason not to:

```text
Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Flow
- cmdk or equivalent command palette

Backend:
- Next.js Route Handlers
- Server Actions where appropriate
- Python scripts for paper/PDF/LLM pipeline if easier

Database:
- Postgres preferred
- SQLite acceptable only if the repo includes a clear migration path to Postgres
- Drizzle ORM or Prisma

Search:
- Keyword search from the start
- Vector search with pgvector if Postgres is available

Automation:
- Cron job or scheduled script
- CLI commands for manual trigger

Testing:
- Unit tests
- Integration tests for pipelines
- Playwright tests for core UI flows

Observability:
- Structured logs
- Error boundary
- Optional Sentry integration
```

---

## 3. Required Agent Skills

The coding agent should install or create the following skills.

### 3.1 Existing skills to install

Install these if the coding environment supports Agent Skills:

```text
anthropics/pdf
anthropics/xlsx
anthropics/docx
anthropics/pptx
anthropics/web-artifacts-builder
anthropics/frontend-design
anthropics/theme-factory
anthropics/webapp-testing
firecrawl/firecrawl-scrape
vercel-labs/react-best-practices
getsentry/sentry-workflow
huggingface/hf-cli
supabase/postgres-best-practices
neondatabase/neon-postgres
```

Use them as follows:

```text
pdf:
- Parse arXiv PDFs
- Extract sections, figures, captions, tables, references, and appendix content
- Run OCR only when necessary

xlsx:
- Export quiz bank, concept list, paper tracker, and progress reports

docx:
- Export interview notes and weekly review documents

pptx:
- Export concept slides and paper review decks

web-artifacts-builder:
- Build React / TypeScript / Tailwind / shadcn UI components

frontend-design:
- Enforce a deliberate premium visual direction

technique/theme-factory:
- Define and apply consistent dark research dashboard theme

webapp-testing:
- Test local web application flows with Playwright

firecrawl-scrape:
- Extract Markdown from project pages, lab pages, GitHub READMEs, blogs, and benchmark pages

react-best-practices:
- Prevent avoidable Next.js and React performance mistakes

sentry-workflow:
- Debug production issues and add observability when configured

hf-cli:
- Query or manage Hugging Face models, datasets, and Spaces when relevant

postgres-best-practices / neon-postgres:
- Maintain robust database schema and query performance
```

### 3.2 Custom skills to create inside this repo

Create a `skills/` directory with the following domain-specific skills:

```text
skills/
  paper-source-scout/
  paper-relevance-ranker/
  paper-deep-reader/
  concept-card-generator/
  quiz-generator/
  interview-mode-coach/
  spaced-review-scheduler/
  knowledge-graph-builder/
  paper-to-implementation-mapper/
  daily-briefing-writer/
```

Each skill must include a `SKILL.md` file with YAML frontmatter and clear instructions. If useful, include `scripts/`, `references/`, and `templates/`.

---

## 4. Custom Skill Specifications

### 4.1 `paper-source-scout`

Purpose:

```text
Collect candidate papers from arXiv, Semantic Scholar, lab blogs, project pages, GitHub repositories, Hugging Face, and other reliable sources.
```

Search topics:

```text
vision language action
VLA robot
robot foundation model
embodied intelligence
world model robotics
world action model
diffusion policy
flow matching robot policy
action chunking
robot manipulation foundation model
RL post-training reasoning LLM
GRPO reasoning
process reward model
outcome reward model
verifier model
RLHF reasoning
RLAIF reasoning
```

Output schema:

```json
{
  "title": "string",
  "authors": ["string"],
  "abstract": "string",
  "source": "arxiv | semantic_scholar | lab_blog | github | huggingface | other",
  "source_url": "string",
  "pdf_url": "string | null",
  "published_date": "YYYY-MM-DD | null",
  "collected_date": "YYYY-MM-DD",
  "topic_tags": ["VLA", "World Model", "RL Post-training"],
  "raw_relevance_notes": "string"
}
```

### 4.2 `paper-relevance-ranker`

Purpose:

```text
Rank collected papers according to the user's preparation needs.
```

Scoring criteria:

```text
VLA relevance
World Model relevance
World Action Model relevance
RL post-training relevance
Embodied Intelligence relevance
Interview value
Implementation value
Foundational importance
Novelty
Code availability
Dataset / benchmark value
Author / lab signal
Recency
```

Return:

```json
{
  "paper_id": "string",
  "relevance_score": 0.0,
  "reading_priority": "Must Read | Skim | Archive",
  "reason": "string",
  "recommended_action": "Deep read | Quick skim | Save for later | Ignore"
}
```

### 4.3 `paper-deep-reader`

Purpose:

```text
Convert one paper into structured learning material.
```

Required output:

```text
Metadata
One-sentence summary
Problem
Motivation
Core idea
Method pipeline
Architecture
Training objective
Datasets
Evaluation benchmarks
Main results
Limitations
Relation to previous work
Implementation notes
Interview value
```

For VLA / robotics papers, always extract:

```text
Observation space
Action space
Action representation
Action chunking strategy
Policy head
Controller interface
Control frequency
Robot platform
Simulation / real-world setting
Dataset
Benchmark
Failure modes
```

For RL post-training papers, always extract:

```text
Base model
Training algorithm
Reward source
Verifier / judge design
Policy optimization objective
Data generation process
Evaluation benchmarks
Ablation results
Failure modes
```

### 4.4 `concept-card-generator`

Purpose:

```text
Generate durable concept cards from papers and user-provided topics.
```

Concept card schema:

```json
{
  "name": "string",
  "aliases": ["string"],
  "domain": "VLA | World Model | RL Post-training | Robotics | Embodied Intelligence | General ML",
  "difficulty": "basic | intermediate | advanced | research-level",
  "short_definition": "string",
  "deep_explanation": "string",
  "why_it_matters": "string",
  "minimal_example": "string",
  "math_notes": "string | null",
  "related_papers": ["paper_id"],
  "related_concepts": ["concept_id"],
  "common_confusions": ["string"],
  "interview_questions": ["string"]
}
```

Target concepts include but are not limited to:

```text
Action chunking
Diffusion Policy
Flow Matching
Behavior Cloning
End-effector delta pose
Receding horizon control
World Model
World Action Model
Vision-Language-Action model
Robot Foundation Model
Embodied Chain-of-Thought
Policy head
Action tokenization
Continuous action trajectory
GRPO
PPO
DPO
RLHF
RLAIF
Process Reward Model
Outcome Reward Model
Verifier Model
Reward hacking
KL penalty
Advantage estimation
Credit assignment
```

### 4.5 `quiz-generator`

Purpose:

```text
Generate interview-oriented questions from papers and concepts.
```

Question types:

```text
Explanation question
Multiple-choice question
Comparison question
Design question
Failure-analysis question
Paper-contribution question
Implementation question
Pseudo-code question
Whiteboard question
```

Every question must include:

```text
Question
Answer
Explanation
Difficulty
Related concept
Related paper, when applicable
Expected interview answer
Common wrong answer
Scoring rubric
```

### 4.6 `interview-mode-coach`

Purpose:

```text
Simulate written test and interview preparation.
```

Modes:

```text
Rapid fire
Deep explanation
Whiteboard system design
Paper deep dive
Concept comparison
Failure diagnosis
Research proposal defense
```

Example output:

```json
{
  "question": "Design a VLA policy that maps image + instruction + robot state to robot actions.",
  "expected_answer": "...",
  "follow_up_questions": ["..."],
  "common_wrong_answers": ["..."],
  "scoring_rubric": "..."
}
```

### 4.7 `spaced-review-scheduler`

Purpose:

```text
Schedule future review based on quiz performance and confidence.
```

Required fields:

```text
last_reviewed_at
next_review_at
difficulty
confidence
correct_count
wrong_count
mastery_score
```

Scheduling rules:

```text
Wrong answer → review tomorrow
Correct but low confidence → review in 3 days
Correct and medium confidence → review in 7 days
Correct and high confidence → review in 14 days
Repeated mastery → review in 30 days
```

### 4.8 `knowledge-graph-builder`

Purpose:

```text
Build and update the graph connecting papers, concepts, methods, models, datasets, and benchmarks.
```

Node types:

```text
Paper
Concept
Method
Model
Dataset
Benchmark
Author
Lab
Equation
Implementation
```

Edge types:

```text
introduced_by
extends
uses
compares_with
evaluated_on
depends_on
contrasts_with
implemented_by
trained_on
```

### 4.9 `paper-to-implementation-mapper`

Purpose:

```text
Extract implementation-relevant details from papers.
```

Output:

```text
Modules to implement
Required datasets
Model components
Loss functions
Training loop
Evaluation loop
Expected configs
Potential pitfalls
Minimal reproduction plan
```

### 4.10 `daily-briefing-writer`

Purpose:

```text
Generate a daily learning briefing.
```

Output:

```text
Top papers today
Why each paper matters
What to read deeply
What to skim
Concepts to learn
Concepts to review
Questions to answer today
Interview readiness notes
```

---

## 5. Required Application Pages

### 5.1 Home Dashboard

The dashboard must immediately show what the user should do today.

Required sections:

```text
Today's Paper Radar
Today's Must Read Papers
Today's Review Queue
Weak Concepts
Interview Drill
Learning Progress
Topic Heatmap
Knowledge Graph Preview
```

### 5.2 Paper Radar

Required features:

```text
Daily collected papers
Search
Topic filter
Relevance sorting
Priority label: Must Read / Skim / Archive
Reading status
Generate summary button
Generate quiz button
Save to knowledge base
```

Each paper card must show:

```text
Title
Authors
Date
Topic tags
Relevance score
One-line contribution
Why it matters
Buttons for Read / Save / Quiz / Archive
```

### 5.3 Paper Reader

Use a three-column layout:

```text
Left: Paper outline and metadata
Center: Structured explanation
Right: Related concepts, generated questions, implementation notes
```

Required actions:

```text
Explain like interview
Explain with math
Compare with related paper
Generate 5 questions
Create concept cards
Map to implementation
```

### 5.4 Concept Atlas

Required features:

```text
Concept search
Domain filtering
Difficulty filtering
Related papers
Related concepts
Common mistakes
Quiz history
Mastery score
```

Each concept page must contain:

```text
Definition
Core intuition
Formal explanation
Minimal example
Classic paper
Modern variants
Common interview questions
Common wrong answers
Related quiz items
```

### 5.5 Knowledge Graph

Use React Flow or an equivalent graph library.

Required features:

```text
Interactive graph
Node filtering
Edge filtering
Topic filtering
Click node to open side panel
Hover edge to see relation explanation
Paper-to-concept connections
Concept-to-question connections
```

### 5.6 Quiz Arena

Required modes:

```text
Daily Review
Weak Concepts
VLA Interview
World Model Interview
RL Post-training Interview
Paper-specific Quiz
Random Drill
```

Required question types:

```text
Explanation
Multiple choice
Comparison
Design
Failure analysis
Paper recall
Implementation
```

Quiz interaction must include:

```text
Answer input
Submit answer
Show expected answer
Show explanation
Show scoring rubric
Record confidence
Update review schedule
Update mastery score
```

### 5.7 Interview Mode

Required modes:

```text
Mock Interview
Rapid Fire
Whiteboard Explanation
System Design
Paper Deep Dive
Research Defense
```

The page must simulate follow-up questions and compare the user's answer against an expected answer.

### 5.8 Learning Roadmap

Required learning paths:

```text
Robotics action basics
Imitation learning
Diffusion Policy
VLA architecture
World Models
World Action Models
RL post-training for reasoning LLMs
Embodied Intelligence research synthesis
```

Each path must show:

```text
Concepts
Papers
Questions
Progress
Mastery score
```

### 5.9 Settings

Required settings:

```text
Paper sources
Search keywords
Daily paper limit
LLM model settings
Review scheduling rules
Export settings
Theme settings
Data backup
```

---

## 6. Data Model

The repo must include schema definitions for these entities.

### 6.1 Paper

```text
id
title
authors
abstract
source
source_url
pdf_url
published_date
collected_date
topic_tags
relevance_score
reading_priority
reading_status
summary_status
created_at
updated_at
```

### 6.2 PaperSummary

```text
id
paper_id
tldr
problem
motivation
core_idea
method_pipeline
architecture
training_objective
datasets
benchmarks
main_results
limitations
implementation_notes
interview_value
created_at
updated_at
```

### 6.3 Concept

```text
id
name
aliases
domain
difficulty
short_definition
deep_explanation
why_it_matters
minimal_example
math_notes
common_confusions
mastery_score
created_at
updated_at
```

### 6.4 Question

```text
id
concept_id
paper_id
type
question
options
answer
explanation
difficulty
tags
expected_interview_answer
common_wrong_answer
scoring_rubric
created_at
updated_at
```

### 6.5 ReviewEvent

```text
id
question_id
user_answer
is_correct
confidence
time_spent_seconds
reviewed_at
next_review_at
```

### 6.6 ConceptEdge

```text
id
source_node_id
target_node_id
source_node_type
target_node_type
relation_type
evidence
paper_id
created_at
```

### 6.7 DailyBriefing

```text
id
date
top_papers
review_queue
weak_concepts
recommended_questions
briefing_text
created_at
```

---

## 7. Data Pipelines

### 7.1 Daily Paper Pipeline

Implement a working command:

```bash
pnpm papers:collect
```

or:

```bash
python scripts/collect_papers.py
```

The command must:

```text
Search paper sources
Deduplicate papers
Rank relevance
Store metadata
Download available PDFs
Parse PDFs
Generate structured summaries
Extract concepts
Generate quiz items
Update daily briefing
Update dashboard data
```

### 7.2 Manual Paper Import

The app must support manual import by:

```text
arXiv URL
PDF URL
Local PDF file
Title / abstract paste
GitHub project URL
Lab blog URL
```

### 7.3 Concept Generation Pipeline

For every processed paper:

```text
Extract important new concepts
Match against existing concepts
Update concept cards if needed
Create relation edges
Generate questions
Schedule review items
```

### 7.4 Quiz Pipeline

For each concept and paper summary:

```text
Generate explanation questions
Generate multiple-choice questions
Generate comparison questions
Generate design questions
Generate failure-analysis questions
Attach answer and explanation
Attach scoring rubric
Attach review metadata
```

---

## 8. UI Design Specification

### 8.1 Visual identity

Name:

```text
Embodied Research OS
```

Style:

```text
Dark neural robotics lab
Premium research cockpit
Glassmorphism
Bento dashboard
Technical typography
Animated knowledge graph
Minimal but high-density information design
```

The UI should feel like:

```text
A robotics research command center
A premium technical dashboard
A serious interview preparation cockpit
```

It must not feel like:

```text
A generic SaaS landing page
A blog template
A student homework page
A static mockup
A toy dashboard
```

### 8.2 Color system

```text
Background: #05070D
Surface: rgba(255,255,255,0.06)
Surface Strong: rgba(255,255,255,0.10)
Border: rgba(255,255,255,0.12)
Primary: #38BDF8
Secondary: #8B5CF6
Accent: #22D3EE
Success: #10B981
Warning: #F59E0B
Danger: #EF4444
Text: #E5E7EB
Muted Text: #94A3B8
```

### 8.3 Typography

```text
Main font: Geist Sans or Inter
Code font: JetBrains Mono
Optional paper-title font: Newsreader or Merriweather
```

### 8.4 Components

Implement reusable components:

```text
AppShell
Sidebar
TopNav
CommandPalette
PaperCard
PaperReader
ConceptCard
ConceptDetailPanel
QuizCard
ReviewQueue
ProgressRing
TopicChip
SourceBadge
DifficultyBadge
KnowledgeGraph
DailyBriefingPanel
SearchBar
FilterBar
EmptyState
ErrorState
LoadingSkeleton
```

### 8.5 Interaction requirements

The UI must include:

```text
Keyboard command palette
Hover states
Loading states
Empty states
Error states
Responsive layout
Animated transitions
Persistent sidebar
Right-side context panel
Search and filter controls
```

---

## 9. Project Structure

Create the repo with this structure or a technically equivalent one:

```text
embodied-research-os/
  AGENTS.md
  README.md
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.ts

  app/
    page.tsx
    papers/
      page.tsx
      [id]/page.tsx
    concepts/
      page.tsx
      [id]/page.tsx
    quiz/
      page.tsx
    interview/
      page.tsx
    graph/
      page.tsx
    roadmap/
      page.tsx
    settings/
      page.tsx
    api/
      papers/
      concepts/
      questions/
      review/
      ingest/

  components/
    layout/
    dashboard/
    papers/
    concepts/
    quiz/
    interview/
    graph/
    roadmap/
    ui/

  lib/
    db/
    arxiv/
    semantic-scholar/
    pdf/
    llm/
    ranking/
    quiz/
    review/
    graph/
    scheduler/
    export/

  skills/
    paper-source-scout/
    paper-relevance-ranker/
    paper-deep-reader/
    concept-card-generator/
    quiz-generator/
    interview-mode-coach/
    spaced-review-scheduler/
    knowledge-graph-builder/
    paper-to-implementation-mapper/
    daily-briefing-writer/

  scripts/
    collect_papers.py
    parse_pdf.py
    generate_summaries.py
    extract_concepts.py
    generate_quiz.py
    update_embeddings.py
    seed_database.ts

  data/
    papers/
    pdfs/
    exports/
    seed/

  tests/
    unit/
    integration/
    e2e/
```

---

## 10. AGENTS.md Requirements

Create a root `AGENTS.md` file.

It must tell the coding agent:

```text
Use current project dependencies and local docs.
Do not rely on outdated framework memory.
Use Next.js App Router patterns.
Use TypeScript strictly.
Prefer server components where possible.
Use client components only for interactive UI.
Create real data flow before visual polish.
Do not create non-functional UI.
Do not leave TODOs for core features.
Add tests for critical flows.
```

Suggested content:

```md
# AGENTS.md

You are building Embodied Research OS.

## Product Goal

Build a complete personal research and interview-preparation web application for VLA, World Models, World Action Models, RL post-training for reasoning LLMs, and Embodied Intelligence.

The app must automatically collect papers, parse PDFs, extract concepts, generate quizzes, schedule review, and display everything in a modern research-dashboard UI.

## Rules

- Do not build a static demo.
- Do not create placeholder-only pages.
- Do not use mock data as the final implementation.
- Do not split work into MVP phases.
- Build a complete usable system from the start.
- Every paper must connect to concepts.
- Every concept must connect to questions.
- Every question must connect to review scheduling.
- Every review event must update mastery score.

## Engineering Standards

- Use Next.js App Router.
- Use TypeScript strictly.
- Use Tailwind CSS and shadcn/ui.
- Use Framer Motion for polished but restrained motion.
- Use React Flow for the knowledge graph.
- Use a real database schema.
- Add seed data only for development.
- Add tests for paper ingestion, concept generation, quiz flow, and core UI navigation.

## UI Direction

Dark neural robotics lab.
Premium research cockpit.
Glassmorphism.
Bento dashboard.
Cyan/violet accents.
Technical but elegant typography.

## Development Order

Implement the system by building the real data model, pipelines, UI pages, interactions, tests, and documentation as one integrated product. Do not stop at design-only output.
```

---

## 11. Acceptance Criteria

The project is complete only when all of the following are true:

```text
The app runs locally with one command.
The database schema is implemented.
The dashboard loads real stored data.
The paper collection pipeline works.
PDF parsing works for downloaded or uploaded papers.
Paper summaries are generated and stored.
Concept cards are generated and stored.
Questions are generated and stored.
Quiz answering works.
Review scheduling works.
Mastery score updates after reviews.
Knowledge graph renders real paper-concept-question links.
Search and filters work.
Settings page can update paper keywords and source preferences.
Manual paper import works.
The UI is modern, polished, responsive, and not generic.
Core flows have tests.
The README explains setup, commands, data model, and usage.
```

---

## 12. Startup Prompt for Coding Agent

Use the following prompt to start from an empty repo.

```text
You are starting from an empty repository.

Build a complete production-quality personal web application called Embodied Research OS.

The user is preparing for written tests and interviews in VLA, World Action Models, World Models, RL post-training for reasoning LLMs, and Embodied Intelligence.

The app must automatically collect relevant papers, parse PDFs, generate structured paper summaries, extract concept cards, generate explanation questions and multiple-choice questions with answers, schedule spaced review, track mastery, and show everything in a premium modern web interface.

Do not create a static mockup, toy demo, or purely visual webpage. Build a real usable system with a database schema, data pipelines, UI pages, interactions, tests, and documentation.

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Flow
- Recharts
- Postgres or SQLite with a clear migration path to Postgres
- Drizzle ORM or Prisma
- Playwright tests

Create these pages:
- Home Dashboard
- Paper Radar
- Paper Reader
- Concept Atlas
- Concept Detail
- Knowledge Graph
- Quiz Arena
- Interview Mode
- Learning Roadmap
- Settings

Create these domain skills in the repo:
- paper-source-scout
- paper-relevance-ranker
- paper-deep-reader
- concept-card-generator
- quiz-generator
- interview-mode-coach
- spaced-review-scheduler
- knowledge-graph-builder
- paper-to-implementation-mapper
- daily-briefing-writer

Create a root AGENTS.md file that instructs future coding agents how to maintain the project.

The core product loop must be:
Paper → Concept → Question → Review → Interview Readiness.

Every paper must become structured learning material.
Every concept must become quiz material.
Every quiz answer must update review scheduling and mastery score.
Every UI page must be functional, not decorative only.

Visual direction:
Dark neural robotics lab.
Premium research cockpit.
Glassmorphism.
Bento dashboard.
Cyan/violet accents.
Technical typography.
Animated knowledge graph.
Clean, modern, professional, dense but readable.

Implement the full repo now. Work systematically across architecture, schema, pipelines, UI, testing, and documentation. Do not ask for permission to make obvious engineering decisions. Use sensible defaults and document them.
```

---

## 13. Final Product Definition

The final product is successful if the user can open the webpage every day and do the following:

```text
See newly collected papers in VLA / World Model / RL post-training.
Know which papers are worth reading.
Read structured explanations instead of raw PDFs only.
Understand concepts from basic terms to classic works.
Practice explanation questions and multiple-choice questions.
See correct answers and scoring rubrics.
Review weak concepts using spaced repetition.
Explore how papers, concepts, methods, datasets, and questions connect.
Prepare for technical interviews with mock interview mode.
Export notes, quiz banks, and progress when needed.
```

The app must become the user's personal research cockpit for embodied AI and reasoning-model post-training preparation.
