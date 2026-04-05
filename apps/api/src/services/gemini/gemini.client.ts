import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Env } from "../../config/env.js";

let client: GoogleGenerativeAI | null = null;

export function getGeminiClient(env: Env): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

export const GEMINI_MODEL = "gemini-2.5-flash";

export const GENERATION_CONFIG = {
  temperature: 1.0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
  responseMimeType: "application/json" as const,
};
