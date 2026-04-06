import { describe, it, expect } from "vitest";
import {
  AppError,
  NotASuperpowerError,
  ContentBlockedError,
  GenerationFailedError,
  ValidationError,
  TeapotError,
} from "./errors.js";

describe("AppError", () => {
  it("sets statusCode, code, and message", () => {
    const err = new AppError(404, "NOT_FOUND", "not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("not found");
    expect(err.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    expect(new AppError(500, "X", "y")).toBeInstanceOf(Error);
  });
});

describe("NotASuperpowerError", () => {
  it("uses default message", () => {
    const err = new NotASuperpowerError();
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("NOT_A_SUPERPOWER");
    expect(err.message).toBe("That's not a superpower, mortal. Try again.");
  });

  it("accepts custom message", () => {
    const err = new NotASuperpowerError("custom");
    expect(err.message).toBe("custom");
  });
});

describe("ContentBlockedError", () => {
  it("uses default message", () => {
    const err = new ContentBlockedError();
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("CONTENT_BLOCKED");
    expect(err.message).toBe("The genie refuses this wish.");
  });

  it("accepts custom message", () => {
    const err = new ContentBlockedError("nope");
    expect(err.message).toBe("nope");
  });
});

describe("GenerationFailedError", () => {
  it("uses default message", () => {
    const err = new GenerationFailedError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("GENERATION_FAILED");
    expect(err.message).toBe("The genie's magic is unstable. Try again.");
  });

  it("accepts custom message", () => {
    const err = new GenerationFailedError("boom");
    expect(err.message).toBe("boom");
  });
});

describe("ValidationError", () => {
  it("sets 400 status and custom message", () => {
    const err = new ValidationError("bad input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("bad input");
  });
});

describe("TeapotError", () => {
  it("uses a random message when none provided", () => {
    const err = new TeapotError();
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("IM_A_TEAPOT");
    expect(err.message).toBeTruthy();
    expect(err.message.length).toBeGreaterThan(0);
  });

  it("accepts custom message", () => {
    const err = new TeapotError("custom teapot");
    expect(err.message).toBe("custom teapot");
  });

  it("always picks from the predefined messages", () => {
    const messages = new Set<string>();
    for (let i = 0; i < 100; i++) {
      messages.add(new TeapotError().message);
    }
    expect(messages.size).toBeGreaterThan(1);
    expect(messages.size).toBeLessThanOrEqual(8);
  });
});
