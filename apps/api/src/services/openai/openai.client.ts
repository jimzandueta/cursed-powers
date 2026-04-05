import OpenAI from "openai";
import type { Env } from "../../config/env.js";

let client: OpenAI | null = null;

export function getOpenAIClient(env: Env): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export const OPENAI_MODEL = "gpt-4o-mini";
