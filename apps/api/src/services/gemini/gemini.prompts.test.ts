import { describe, it, expect } from "vitest";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  STRICT_RETRY_SUFFIX,
  GEMINI_RESPONSE_SCHEMA,
} from "./gemini.prompts.js";

describe("SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(SYSTEM_PROMPT).toBeTruthy();
    expect(typeof SYSTEM_PROMPT).toBe("string");
  });

  it("mentions cursed superpowers", () => {
    expect(SYSTEM_PROMPT).toContain("cursed superpowers");
  });

  it("includes all categories", () => {
    expect(SYSTEM_PROMPT).toContain("Technically True");
    expect(SYSTEM_PROMPT).toContain("Cosmically Unfair");
    expect(SYSTEM_PROMPT).toContain("Painfully Specific");
    expect(SYSTEM_PROMPT).toContain("Existentially Cruel");
    expect(SYSTEM_PROMPT).toContain("Aggressively Useless");
  });
});

describe("buildUserPrompt", () => {
  it("includes the wish in the prompt", () => {
    const prompt = buildUserPrompt("flying");
    expect(prompt).toContain("flying");
  });

  it("wraps wish in quotes", () => {
    const prompt = buildUserPrompt("super speed");
    expect(prompt).toContain('"super speed"');
  });

  it("asks for JSON response", () => {
    const prompt = buildUserPrompt("test");
    expect(prompt).toContain("JSON");
  });

  it("includes recent categories when provided", () => {
    const prompt = buildUserPrompt("flight", [
      "Technically True",
      "Cosmically Unfair",
    ]);
    expect(prompt).toContain("Avoid these recently used categories");
    expect(prompt).toContain('"Technically True"');
  });
});

describe("STRICT_RETRY_SUFFIX", () => {
  it("is a non-empty string emphasizing JSON", () => {
    expect(STRICT_RETRY_SUFFIX).toContain("JSON");
    expect(STRICT_RETRY_SUFFIX).toContain("IMPORTANT");
  });
});

describe("GEMINI_RESPONSE_SCHEMA", () => {
  it("has all required fields", () => {
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("isValidSuperpower");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("cursedPower");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("butClause");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("explanation");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("uselessnessScore");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("category");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("rejectionReason");
    expect(GEMINI_RESPONSE_SCHEMA.required).toContain("originalPower");
  });

  it("defines properties for each field", () => {
    const props = Object.keys(GEMINI_RESPONSE_SCHEMA.properties);
    expect(props).toContain("isValidSuperpower");
    expect(props).toContain("cursedPower");
    expect(props).toContain("butClause");
    expect(props).toContain("explanation");
    expect(props).toContain("uselessnessScore");
    expect(props).toContain("category");
  });

  it("category has enum with all 5 categories", () => {
    const cat = GEMINI_RESPONSE_SCHEMA.properties.category;
    expect(cat.enum).toHaveLength(5);
  });
});
