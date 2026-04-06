import { describe, it, expect } from "vitest";
import { generateWishId, generateRequestId } from "./id.js";

describe("generateWishId", () => {
  it("starts with w_ prefix", () => {
    expect(generateWishId()).toMatch(/^w_/);
  });

  it("has correct length (w_ + 8 chars)", () => {
    expect(generateWishId()).toHaveLength(10);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateWishId()));
    expect(ids.size).toBe(100);
  });
});

describe("generateRequestId", () => {
  it("starts with req_ prefix", () => {
    expect(generateRequestId()).toMatch(/^req_/);
  });

  it("has correct length (req_ + 10 chars)", () => {
    expect(generateRequestId()).toHaveLength(14);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});
