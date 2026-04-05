import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env from monorepo root
// Try multiple paths to handle both tsx (from apps/api) and turbo (from root)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

import { loadEnv } from "./config/env.js";
import { buildApp } from "./app.js";
import { initDb, closeDb } from "./db/index.js";

async function main() {
  const env = loadEnv();

  // Initialize database
  initDb(env.DATABASE_URL);

  const app = await buildApp(env);

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);

    try {
      await app.close();
      closeDb();
      app.log.info("Shutdown complete");
      process.exit(0);
    } catch (err) {
      app.log.error(err, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    app.log.error(err, "Uncaught exception");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    app.log.error({ reason }, "Unhandled rejection");
    shutdown("unhandledRejection");
  });

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Cursed Wishes API running on port ${env.PORT}`);
    app.log.info(
      `PID: ${process.pid} | Node: ${process.version} | Env: ${env.NODE_ENV}`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
