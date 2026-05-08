import { settings } from "../db/schema";
import { db } from "../lib/db/client";

async function main() {
  await db.select().from(settings).limit(1);
  console.log("Database initialized and schema ensured.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
