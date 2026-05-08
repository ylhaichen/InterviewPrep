import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function run(cmd: string, env: Record<string, string>) {
  execSync(cmd, {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, ...env }
  });
}

describe("pipeline scripts", () => {
  it("collects papers and builds learning assets", () => {
    const dbPath = path.join(os.tmpdir(), `embodied-test-${Date.now()}.db`);
    const env = { DATABASE_URL: dbPath };

    run("python3 scripts/init_db.py", env);
    run("python3 scripts/collect_papers.py --run-all", env);

    const db = new Database(dbPath, { readonly: true });

    const paperCount = db.prepare("SELECT COUNT(*) AS count FROM papers").get() as { count: number };
    const summaryCount = db
      .prepare("SELECT COUNT(*) AS count FROM paper_summaries")
      .get() as { count: number };
    const conceptCount = db.prepare("SELECT COUNT(*) AS count FROM concepts").get() as { count: number };
    const questionCount = db.prepare("SELECT COUNT(*) AS count FROM questions").get() as { count: number };

    expect(paperCount.count).toBeGreaterThan(0);
    expect(summaryCount.count).toBeGreaterThan(0);
    expect(conceptCount.count).toBeGreaterThan(0);
    expect(questionCount.count).toBeGreaterThan(0);

    db.close();
    fs.rmSync(dbPath, { force: true });
  });
});
