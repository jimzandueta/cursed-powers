import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../config/env.js";
import type { GeminiWishResponse } from "@cursed-wishes/shared";

const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
  SchemaType: {
    OBJECT: "OBJECT",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    INTEGER: "INTEGER",
  },
}));

vi.mock("../openai/openai.service.js", () => ({
  generateWithOpenAI: vi.fn().mockResolvedValue(null),
}));

const validResponse: GeminiWishResponse = {
  isValidSuperpower: true,
  rejectionReason: "",
  originalPower: "Flight",
  cursedPower: "Flight, but only 2mm above ground",
  butClause: "but only 2mm above ground",
  explanation: "Technically flying. Practically hovering.",
  uselessnessScore: 92,
  category: "Technically True",
};

const logger = {
  info: vi.fn(),
  error: vi.fn(),
};

function makeEnv(overrides = {}): Env {
  return {
    PORT: 3001,
    NODE_ENV: "test",
    LOG_LEVEL: "info",
    DATABASE_URL: "file:./test.db",
    GEMINI_API_KEY: "test-gemini-key",
    OPENAI_API_KEY: "",
    CORS_ORIGIN: "http://localhost:3000",
    RATE_LIMIT_MAX: 10,
    RATE_LIMIT_WINDOW_MS: 60000,
    ...overrides,
  } as Env;
}

describe("generateCursedWish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns a valid Gemini response on first attempt", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(validResponse) },
    });

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("flight", makeEnv(), logger);

    expect(result.isValidSuperpower).toBe(true);
    expect(result.cursedPower).toBe("Flight, but only 2mm above ground");
  });

  it("retries with strict suffix on first failure", async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify(validResponse) },
      });

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("flight", makeEnv(), logger);

    expect(result.cursedPower).toBe("Flight, but only 2mm above ground");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("falls back to hardcoded wishes when Gemini fails completely", async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"));

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("flight", makeEnv(), logger);

    expect(result.isValidSuperpower).toBe(true);
    expect([
      "Painfully Specific",
      "Cosmically Unfair",
      "Aggressively Useless",
    ]).toContain(result.category);
  });

  it("falls back when Gemini returns invalid JSON", async () => {
    mockGenerateContent
      .mockResolvedValueOnce({
        response: { text: () => "not json" },
      })
      .mockResolvedValueOnce({
        response: { text: () => "still not json" },
      });

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("flight", makeEnv(), logger);

    expect(result.isValidSuperpower).toBe(true);
  });

  it("falls back when Gemini returns invalid schema", async () => {
    mockGenerateContent
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify({ wrong: "schema" }) },
      })
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify({ also: "wrong" }) },
      });

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("flight", makeEnv(), logger);

    expect(result.isValidSuperpower).toBe(true);
  });

  it("uses OpenAI when only OPENAI_API_KEY is set", async () => {
    const { generateWithOpenAI } = await import("../openai/openai.service.js");
    vi.mocked(generateWithOpenAI).mockResolvedValueOnce(validResponse);

    const { generateCursedWish } = await import("./gemini.service.js");
    const env = makeEnv({ GEMINI_API_KEY: "", OPENAI_API_KEY: "ok" });
    const result = await generateCursedWish("flight", env, logger);

    expect(result.cursedPower).toBe("Flight, but only 2mm above ground");
  });

  it("falls back to hardcoded when OpenAI also fails", async () => {
    const { generateWithOpenAI } = await import("../openai/openai.service.js");
    vi.mocked(generateWithOpenAI).mockResolvedValueOnce(null);

    const { generateCursedWish } = await import("./gemini.service.js");
    const env = makeEnv({ GEMINI_API_KEY: "", OPENAI_API_KEY: "ok" });
    const result = await generateCursedWish("flight", env, logger);

    expect(result.isValidSuperpower).toBe(true);
  });

  it("handles invalid superpower response", async () => {
    const invalidResponse = {
      ...validResponse,
      isValidSuperpower: false,
      rejectionReason: "That's not a power, mortal.",
    };

    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify(invalidResponse) },
    });

    const { generateCursedWish } = await import("./gemini.service.js");
    const result = await generateCursedWish("a sandwich", makeEnv(), logger);

    expect(result.isValidSuperpower).toBe(false);
    expect(result.rejectionReason).toBe("That's not a power, mortal.");
  });
});
