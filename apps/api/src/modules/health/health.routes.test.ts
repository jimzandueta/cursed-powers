import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rmSync } from "node:fs";
import { buildApp } from "../../app.js";
import { initDb, closeDb } from "../../db/index.js";
import type { Env } from "../../config/env.js";

const testDbPath = "./data/test-health.db";

function makeEnv(): Env {
  return {
    PORT: 3001,
    NODE_ENV: "test",
    LOG_LEVEL: "error",
    DATABASE_URL: testDbPath,
    GEMINI_API_KEY: "test-key",
    OPENAI_API_KEY: "",
    CORS_ORIGIN: "*",
    RATE_LIMIT_MAX: 1000,
    RATE_LIMIT_WINDOW_MS: 60000,
  } as Env;
}

describe("health routes", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    initDb(testDbPath);
    app = await buildApp(makeEnv());
  });

  afterEach(async () => {
    await app.close();
    closeDb();
    try {
      rmSync(testDbPath, { force: true });
      rmSync(`${testDbPath}-wal`, { force: true });
      rmSync(`${testDbPath}-shm`, { force: true });
    } catch {}
  });

  it("GET /api/v1/health returns 200 with health info", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);

    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(body.timestamp).toBeDefined();
    expect(body.uptime.seconds).toBeGreaterThanOrEqual(0);
    expect(body.uptime.human).toMatch(/\d+d \d+h \d+m \d+s/);
    expect(body.database.status).toBe("healthy");
    expect(body.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(body.circuitBreakers.gemini).toBeDefined();
    expect(body.circuitBreakers.openai).toBeDefined();
    expect(body.process.pid).toBe(process.pid);
    expect(body.process.nodeVersion).toBe(process.version);
    expect(body.process.memory.rss).toContain("MB");
    expect(body.process.memory.heapUsed).toContain("MB");
  });

  it("returns degraded when DB is unhealthy", async () => {
    // Close the DB so health check fails
    closeDb();

    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("degraded");
    expect(body.database.status).toBe("unhealthy");
    expect(body.database.latencyMs).toBe(-1);

    // Reinit for teardown
    initDb(testDbPath);
  });
});
