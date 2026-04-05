import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env from monorepo root
// Try multiple paths to handle both tsx (from apps/api) and turbo (from root)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

import { loadEnv } from "./config/env.js";
import { buildApp } from "./app.js";
import { initDb } from "./db/index.js";

async function main() {
  const env = loadEnv();

  // Initialize database
  initDb(env.DATABASE_URL);

  const app = await buildApp(env);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`🧞 Cursed Wishes API running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
