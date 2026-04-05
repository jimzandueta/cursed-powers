import {
  GeminiWishResponseSchema,
  type GeminiWishResponse,
} from "@cursed-wishes/shared";
import type { GoogleGenerativeAI } from "@google/generative-ai";
import type { Env } from "../../config/env.js";
import { GenerationFailedError } from "../../lib/errors.js";
import {
  getGeminiClient,
  GEMINI_MODEL,
  GENERATION_CONFIG,
} from "./gemini.client.js";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  STRICT_RETRY_SUFFIX,
  GEMINI_RESPONSE_SCHEMA,
} from "./gemini.prompts.js";
import { generateWithOpenAI } from "../openai/openai.service.js";

type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

const FALLBACK_WISHES: GeminiWishResponse[] = [
  {
    isValidSuperpower: true,
    rejectionReason: "",
    originalPower: "Super Strength",
    cursedPower: "Super Strength, but only in your pinky toe",
    butClause: "but only in your pinky toe",
    explanation:
      "You possess strength beyond measure — concentrated entirely in your smallest digit. Furniture corners beware.",
    uselessnessScore: 91,
    category: "Painfully Specific",
  },
  {
    isValidSuperpower: true,
    rejectionReason: "",
    originalPower: "Telepathy",
    cursedPower: "Telepathy, but you can only read the thoughts of houseplants",
    butClause: "but you can only read the thoughts of houseplants",
    explanation:
      "You have unlocked the power to hear what your fern thinks about its watering schedule. It's always the same thought.",
    uselessnessScore: 94,
    category: "Cosmically Unfair",
  },
  {
    isValidSuperpower: true,
    rejectionReason: "",
    originalPower: "Laser Vision",
    cursedPower: "Laser Vision, but it's a harmless laser pointer dot",
    butClause: "but it's a harmless laser pointer dot",
    explanation:
      "Your eyes project a focused beam of light — at 1 milliwatt. Cats will love you. Enemies will not be impressed.",
    uselessnessScore: 88,
    category: "Aggressively Useless",
  },
];

function getProvider(env: Env): "gemini" | "openai" {
  if (env.GEMINI_API_KEY) return "gemini";
  if (env.OPENAI_API_KEY) return "openai";
  /* v8 ignore next 2 */
  return "gemini";
}

export async function generateCursedWish(
  wish: string,
  env: Env,
  logger: Logger,
): Promise<GeminiWishResponse> {
  const provider = getProvider(env);
  logger.info({ provider }, "Using AI provider");

  if (provider === "gemini") {
    const result = await generateWithGemini(wish, env, logger);
    if (result) return result;
  } else {
    const result = await generateWithOpenAI(wish, env, logger);
    if (result) return result;
  }

  // Fallback — return a random pre-written cursed wish
  logger.info("Using fallback cursed wish");
  return FALLBACK_WISHES[Math.floor(Math.random() * FALLBACK_WISHES.length)];
}

async function generateWithGemini(
  wish: string,
  env: Env,
  logger: Logger,
): Promise<GeminiWishResponse | null> {
  const client = getGeminiClient(env);
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      ...GENERATION_CONFIG,
      responseSchema: GEMINI_RESPONSE_SCHEMA as any,
    },
  });

  const userPrompt = buildUserPrompt(wish);

  // First attempt
  try {
    const result = await callGemini(model, userPrompt, logger);
    if (result) return result;
    logger.error("Gemini returned unparseable response on attempt 1");
  } catch (err) {
    logger.error(
      { err: String(err), attempt: 1 },
      "Gemini first attempt failed",
    );
  }

  // Retry with stricter prompt
  try {
    const result = await callGemini(
      model,
      userPrompt + STRICT_RETRY_SUFFIX,
      logger,
    );
    if (result) return result;
    logger.error("Gemini returned unparseable response on attempt 2");
  } catch (err) {
    logger.error(
      { err: String(err), attempt: 2 },
      "Gemini retry attempt failed",
    );
  }

  return null;
}

async function callGemini(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string,
  logger: Logger,
): Promise<GeminiWishResponse | null> {
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  logger.info({ rawResponse: text.slice(0, 500) }, "Gemini raw response");

  try {
    const parsed = JSON.parse(text);
    const validated = GeminiWishResponseSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
    logger.error(
      { zodErrors: validated.error.flatten() },
      "Gemini response failed Zod validation",
    );
    return null;
  } catch (parseErr) {
    logger.error(
      { parseErr: String(parseErr), text: text.slice(0, 200) },
      "Failed to parse Gemini JSON",
    );
    return null;
  }
}
