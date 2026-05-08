import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/db/schema";
import { ensureSchema } from "@/lib/db/ensure-schema";

const databaseUrl = process.env.DATABASE_URL ?? "./data/embodied-research.db";

declare global {
  // eslint-disable-next-line no-var
  var __embodiedDbClient: DbClient | undefined;
}

function buildClient() {
  const sqlite = new Database(databaseUrl);
  ensureSchema(sqlite);
  return drizzle(sqlite, { schema });
}

type DbClient = ReturnType<typeof buildClient>;

export const db = global.__embodiedDbClient ?? buildClient();

if (process.env.NODE_ENV !== "production") {
  global.__embodiedDbClient = db;
}

export { schema };
