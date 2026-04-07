import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadEnv, type Env } from "./env.js";

describe("loadEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns defaults when minimal env is set", () => {
    process.env.GEMINI_API_KEY = "test-key";
    delete process.env.NODE_ENV;
    const env = loadEnv();

    expect(env.PORT).toBe(3001);
    expect(env.NODE_ENV).toBe("development");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.DATABASE_URL).toBe("file:./data/wishes.db");
    expect(env.GEMINI_API_KEY).toBe("test-key");
    expect(env.CORS_ORIGIN).toBe("http://localhost:3000");
    expect(env.RATE_LIMIT_MAX).toBe(50);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(14_400_000);
    expect(env.TURNSTILE_SECRET_KEY).toBe("");
    expect(env.REQUEST_SIGNING_KEY).toBe("");
  });

  it("parses custom values", () => {
    process.env.PORT = "4000";
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "debug";
    process.env.DATABASE_URL = "file:./test.db";
    process.env.GEMINI_API_KEY = "gk";
    process.env.OPENAI_API_KEY = "ok";
    process.env.CORS_ORIGIN = "https://example.com";
    process.env.RATE_LIMIT_MAX = "100";
    process.env.RATE_LIMIT_WINDOW_MS = "30000";

    const env = loadEnv();
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("production");
    expect(env.LOG_LEVEL).toBe("debug");
    expect(env.DATABASE_URL).toBe("file:./test.db");
    expect(env.OPENAI_API_KEY).toBe("ok");
    expect(env.CORS_ORIGIN).toBe("https://example.com");
    expect(env.RATE_LIMIT_MAX).toBe(100);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(30000);
  });

  it("exits when neither API key is provided", () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    loadEnv();

    expect(exitSpy).toHaveBeenCalledWith(1);
    consoleSpy.mockRestore();
  });

  it("accepts OPENAI_API_KEY alone", () => {
    delete process.env.GEMINI_API_KEY;
    process.env.OPENAI_API_KEY = "ok";

    const env = loadEnv();
    expect(env.OPENAI_API_KEY).toBe("ok");
  });

  it("coerces PORT from string", () => {
    process.env.GEMINI_API_KEY = "test";
    process.env.PORT = "8080";
    expect(loadEnv().PORT).toBe(8080);
  });

  it("accepts test NODE_ENV", () => {
    process.env.GEMINI_API_KEY = "test";
    process.env.NODE_ENV = "test";
    expect(loadEnv().NODE_ENV).toBe("test");
  });

  it("defaults GEMINI_API_KEY and OPENAI_API_KEY to empty string", () => {
    // Need at least one — but both default to ""
    // This should trigger the refinement failure
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});

    loadEnv();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
