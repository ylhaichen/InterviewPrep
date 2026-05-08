---
name: knowledge-graph-builder
description: Build graph nodes and edges connecting papers, concepts, and questions.
triggers:
  - update knowledge graph
  - inspect concept relationships
inputs:
  - papers
  - concepts
  - questions
  - concept edges
outputs:
  - graph nodes
  - graph edges
---

# knowledge-graph-builder

## Task
Materialize graph view for interactive exploration.

## Instructions
1. Pull core entities from DB.
2. Build node set for Paper/Concept/Question.
3. Build edges from links and explicit relation records.
4. Attach evidence text for edge-hover explanation.

## Scripts / References
- `lib/services/graph.ts`
- `components/graph/knowledge-graph-canvas.tsx`

## Output Contract
`{nodes, edges, stats}` for React Flow rendering.
