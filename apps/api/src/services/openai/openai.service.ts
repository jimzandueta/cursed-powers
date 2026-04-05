import {
  GeminiWishResponseSchema,
  type GeminiWishResponse,
  CATEGORIES,
} from "@cursed-wishes/shared";
import type { Env } from "../../config/env.js";
import { getOpenAIClient, OPENAI_MODEL } from "./openai.client.js";
import { SYSTEM_PROMPT, buildUserPrompt, STRICT_RETRY_SUFFIX } from "../gemini/gemini.prompts.js";

const OPENAI_JSON_SCHEMA_HINT = `

You MUST respond with a JSON object using EXACTLY these field names:
{
  "isValidSuperpower": boolean,
  "rejectionReason": string (empty string if valid),
  "originalPower": string (the normalized superpower name),
  "cursedPower": string (the full cursed version, e.g. "Flight, but only 2mm above the floor"),
  "butClause": string (just the "but..." part),
  "explanation": string (deadpan 1-2 sentence explanation),
  "uselessnessScore": integer (70-99, be VARIED — don't always pick 85. 94+ = devastatingly ironic, 80-87 = pointless, 70-79 = has a tiny niche use),
  "category": one of ${CATEGORIES.map((c) => `"${c}"`).join(", ")}
}

Do NOT rename or omit any fields. Do NOT add extra fields.`;

type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export async function generateWithOpenAI(
  wish: string,
  env: Env,
  logger: Logger,
): Promise<GeminiWishResponse | null> {
  const client = getOpenAIClient(env);
  const userPrompt = buildUserPrompt(wish);

  // First attempt
  try {
    const result = await callOpenAI(client, userPrompt, logger);
    if (result) return result;
    logger.error("OpenAI returned unparseable response on attempt 1");
  } catch (err) {
    logger.error({ err: String(err), attempt: 1 }, "OpenAI first attempt failed");
  }

  // Retry with stricter prompt
  try {
    const result = await callOpenAI(client, userPrompt + STRICT_RETRY_SUFFIX, logger);
    if (result) return result;
    logger.error("OpenAI returned unparseable response on attempt 2");
  } catch (err) {
    logger.error({ err: String(err), attempt: 2 }, "OpenAI retry attempt failed");
  }

  return null;
}

async function callOpenAI(
  client: InstanceType<typeof import("openai").default>,
  userPrompt: string,
  logger: Logger,
): Promise<GeminiWishResponse | null> {
  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT + OPENAI_JSON_SCHEMA_HINT },
      { role: "user", content: userPrompt },
    ],
    temperature: 1.0,
    max_tokens: 512,
  });

  const text = completion.choices[0]?.message?.content ?? "";
  logger.info({ rawResponse: text.slice(0, 500) }, "OpenAI raw response");

  try {
    const parsed = JSON.parse(text);
    const validated = GeminiWishResponseSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }
    logger.error({ zodErrors: validated.error.flatten() }, "OpenAI response failed Zod validation");
    return null;
  } catch (parseErr) {
    logger.error({ parseErr: String(parseErr), text: text.slice(0, 200) }, "Failed to parse OpenAI JSON");
    return null;
  }
}
