import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../config/env.js";

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn(),
    })),
  };
});

describe("getGeminiClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a singleton client", async () => {
    const { getGeminiClient } = await import("./gemini.client.js");
    const env = { GEMINI_API_KEY: "test-key" } as Env;

    const client1 = getGeminiClient(env);
    const client2 = getGeminiClient(env);
    expect(client1).toBe(client2);
  });
});

describe("constants", () => {
  it("exports GEMINI_MODEL", async () => {
    const { GEMINI_MODEL } = await import("./gemini.client.js");
    expect(GEMINI_MODEL).toBe("gemini-2.5-pro");
  });

  it("exports GENERATION_CONFIG with expected values", async () => {
    const { GENERATION_CONFIG } = await import("./gemini.client.js");
    expect(GENERATION_CONFIG.temperature).toBe(1.0);
    expect(GENERATION_CONFIG.topP).toBe(0.95);
    expect(GENERATION_CONFIG.topK).toBe(40);
    expect(GENERATION_CONFIG.maxOutputTokens).toBe(4096);
    expect(GENERATION_CONFIG.responseMimeType).toBe("application/json");
  });
});
