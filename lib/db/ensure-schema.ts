import type Database from "better-sqlite3";

const TABLE_DDLS = [
  `CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    abstract TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    pdf_url TEXT,
    published_date TEXT,
    collected_date TEXT NOT NULL,
    topic_tags TEXT NOT NULL,
    relevance_score REAL NOT NULL DEFAULT 0,
    reading_priority TEXT NOT NULL DEFAULT 'Skim',
    reading_status TEXT NOT NULL DEFAULT 'unread',
    summary_status TEXT NOT NULL DEFAULT 'pending',
    one_line_contribution TEXT NOT NULL DEFAULT '',
    why_it_matters TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS paper_summaries (
    id TEXT PRIMARY KEY,
    paper_id TEXT NOT NULL UNIQUE,
    tldr TEXT NOT NULL,
    problem TEXT NOT NULL,
    motivation TEXT NOT NULL,
    core_idea TEXT NOT NULL,
    method_pipeline TEXT NOT NULL,
    architecture TEXT NOT NULL,
    training_objective TEXT NOT NULL,
    datasets TEXT NOT NULL,
    benchmarks TEXT NOT NULL,
    main_results TEXT NOT NULL,
    limitations TEXT NOT NULL,
    implementation_notes TEXT NOT NULL,
    interview_value TEXT NOT NULL,
    extra_structured TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    aliases TEXT NOT NULL DEFAULT '[]',
    domain TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    short_definition TEXT NOT NULL,
    deep_explanation TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    minimal_example TEXT NOT NULL,
    math_notes TEXT,
    common_confusions TEXT NOT NULL DEFAULT '[]',
    interview_questions TEXT NOT NULL DEFAULT '[]',
    mastery_score REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS paper_concept_links (
    id TEXT PRIMARY KEY,
    paper_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    strength REAL NOT NULL DEFAULT 0.5,
    created_at TEXT NOT NULL,
    FOREIGN KEY(paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY(concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    UNIQUE(paper_id, concept_id)
  );`,
  `CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    concept_id TEXT,
    paper_id TEXT,
    type TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT,
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    expected_interview_answer TEXT NOT NULL,
    common_wrong_answer TEXT NOT NULL,
    scoring_rubric TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(concept_id) REFERENCES concepts(id) ON DELETE SET NULL,
    FOREIGN KEY(paper_id) REFERENCES papers(id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS question_review_states (
    question_id TEXT PRIMARY KEY,
    last_reviewed_at TEXT,
    next_review_at TEXT,
    difficulty TEXT NOT NULL DEFAULT 'intermediate',
    confidence TEXT NOT NULL DEFAULT 'medium',
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    mastery_score REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS review_events (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    confidence TEXT NOT NULL,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    reviewed_at TEXT NOT NULL,
    next_review_at TEXT NOT NULL,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS concept_edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    source_node_type TEXT NOT NULL,
    target_node_type TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    evidence TEXT NOT NULL,
    paper_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(paper_id) REFERENCES papers(id) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS daily_briefings (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    top_papers TEXT NOT NULL DEFAULT '[]',
    review_queue TEXT NOT NULL DEFAULT '[]',
    weak_concepts TEXT NOT NULL DEFAULT '[]',
    recommended_questions TEXT NOT NULL DEFAULT '[]',
    briefing_text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    paper_sources TEXT NOT NULL DEFAULT '[]',
    search_keywords TEXT NOT NULL DEFAULT '[]',
    daily_paper_limit INTEGER NOT NULL DEFAULT 10,
    llm_model TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
    review_rules TEXT NOT NULL DEFAULT '{}',
    export_settings TEXT NOT NULL DEFAULT '{}',
    theme TEXT NOT NULL DEFAULT 'neural-lab',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS learning_paths (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    progress REAL NOT NULL DEFAULT 0,
    mastery_score REAL NOT NULL DEFAULT 0,
    concept_ids TEXT NOT NULL DEFAULT '[]',
    paper_ids TEXT NOT NULL DEFAULT '[]',
    question_ids TEXT NOT NULL DEFAULT '[]'
  );`,
  `CREATE TABLE IF NOT EXISTS interview_prompts (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    question TEXT NOT NULL,
    expected_answer TEXT NOT NULL,
    follow_ups TEXT NOT NULL DEFAULT '[]',
    common_wrong_answers TEXT NOT NULL DEFAULT '[]',
    scoring_rubric TEXT NOT NULL,
    related_concept_ids TEXT NOT NULL DEFAULT '[]',
    related_paper_ids TEXT NOT NULL DEFAULT '[]'
  );`,
  `CREATE INDEX IF NOT EXISTS idx_papers_relevance ON papers(relevance_score DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_papers_priority ON papers(reading_priority);`,
  `CREATE INDEX IF NOT EXISTS idx_questions_concept ON questions(concept_id);`,
  `CREATE INDEX IF NOT EXISTS idx_questions_paper ON questions(paper_id);`,
  `CREATE INDEX IF NOT EXISTS idx_review_next ON question_review_states(next_review_at);`,
  `CREATE INDEX IF NOT EXISTS idx_concept_mastery ON concepts(mastery_score);`,
  `CREATE INDEX IF NOT EXISTS idx_edges_source ON concept_edges(source_node_id);`,
  `CREATE INDEX IF NOT EXISTS idx_edges_target ON concept_edges(target_node_id);`
] as const;

export function ensureSchema(database: Database.Database): void {
  database.pragma("foreign_keys = ON");

  const transaction = database.transaction(() => {
    for (const ddl of TABLE_DDLS) {
      database.prepare(ddl).run();
    }
  });

  transaction();
}
