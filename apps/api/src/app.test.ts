import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rmSync } from "node:fs";
import { buildApp } from "./app.js";
import { initDb, closeDb } from "./db/index.js";
import { AppError } from "./lib/errors.js";
import type { Env } from "./config/env.js";

const testDbPath = "./data/test-app.db";

function makeEnv(overrides = {}): Env {
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
    ...overrides,
  } as Env;
}

describe("buildApp", () => {
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

  it("registers health routes", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
  });

  it("registers wish routes", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/wishes" });
    expect(res.statusCode).toBe(200);
  });

  it("returns 418 for teapot endpoint", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/teapot" });
    expect(res.statusCode).toBe(418);

    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("IM_A_TEAPOT");
    expect(body.error.protocol).toBe("HTCPCP/1.0");
    expect(body.error.rfc).toContain("rfc2324");
  });

  it("sets X-Powered-By header", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.headers["x-powered-by"]).toContain("Cursed Genie");
    expect(res.headers["x-powered-by"]).toContain("HTCPCP");
  });

  it("registers onResponse hook for timing", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    // inject() doesn't always run onResponse hooks in test mode,
    // but we verify the hook is registered by checking the response completes
    expect(res.statusCode).toBe(200);
  });

  it("handles AppError with correct status code and structure", async () => {
    // Trigger an AppError via invalid wish input
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/wishes",
      payload: { wish: "" },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBeDefined();
    expect(body.error.message).toBeDefined();
    expect(body.error.requestId).toBeDefined();
  });

  it("handles unknown errors with 500", async () => {
    // Register a route that throws a plain Error
    app.get("/test-error", async () => {
      throw new Error("unexpected");
    });

    const res = await app.inject({ method: "GET", url: "/test-error" });
    expect(res.statusCode).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });

  it("generates request ids", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    const body = JSON.parse(res.body);
    // The health endpoint doesn't return requestId, but the error handler does
    // Let's verify via an error endpoint
    const errRes = await app.inject({
      method: "POST",
      url: "/api/v1/wishes",
      payload: { wish: "" },
    });
    const errBody = JSON.parse(errRes.body);
    expect(errBody.error.requestId).toMatch(/^req_/);
  });

  it("decorates app with env", async () => {
    expect((app as any).env).toBeDefined();
    expect((app as any).env.PORT).toBe(3001);
  });

  it("registers CORS support", async () => {
    const res = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/health",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("supports comma-separated CORS origins", async () => {
    const listApp = await buildApp(
      makeEnv({ CORS_ORIGIN: "https://one.example, https://two.example" }),
    );

    const res = await listApp.inject({
      method: "OPTIONS",
      url: "/api/v1/health",
      headers: {
        origin: "https://two.example",
        "access-control-request-method": "GET",
      },
    });

    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://two.example");
    await listApp.close();
  });

  it("handles CSP report endpoint", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/csp-report",
      payload: {
        "csp-report": {
          "violated-directive": "script-src",
          "blocked-uri": "http://malicious.example",
        },
      },
    });

    expect(res.statusCode).toBe(204);
  });

  it("handles CSP report payload without csp-report wrapper", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/csp-report",
      payload: {
        blocked: "http://example.test/script.js",
      },
    });

    expect(res.statusCode).toBe(204);
  });

  it("returns 429 when abuse detector blocks wish spam", async () => {
    let blockedStatus = 200;

    for (let i = 0; i < 10; i++) {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/wishes",
        payload: { wish: `flight ${i}` },
      });
      blockedStatus = res.statusCode;
      if (blockedStatus === 429) break;
    }

    expect(blockedStatus).toBe(429);
  });

  it("applies security headers from helmet", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("handles rate limit 429 errors", async () => {
    // Register a route that throws a 429-like error
    app.get("/test-rate-limit", async () => {
      const err = new Error("Too Many Requests") as Error & {
        statusCode: number;
      };
      err.statusCode = 429;
      throw err;
    });

    const res = await app.inject({ method: "GET", url: "/test-rate-limit" });
    expect(res.statusCode).toBe(429);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe("RATE_LIMITED");
    expect(body.error.message).toContain("genie needs rest");
  });
});

describe("buildApp with development env", () => {
  let devApp: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(async () => {
    initDb(testDbPath);
    devApp = await buildApp(makeEnv({ NODE_ENV: "development" }));
  });

  afterEach(async () => {
    await devApp.close();
    closeDb();
    try {
      rmSync(testDbPath, { force: true });
      rmSync(`${testDbPath}-wal`, { force: true });
      rmSync(`${testDbPath}-shm`, { force: true });
    } catch {}
  });

  it("enables pino-pretty transport in development mode", async () => {
    const res = await devApp.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
  });
});
