import { SchemaType } from "@google/generative-ai";
import { CATEGORIES } from "@cursed-wishes/shared";

export const SYSTEM_PROMPT = `You generate cursed superpowers.

Your output must match the JSON schema exactly.

STYLE
- Voice: dry, concise, confident, quietly amused.
- Short punchy wording. No rambling.

CORE TASK
Given a user's wish, decide whether it is a real superpower.
- A valid superpower is an abnormal ability, perception, transformation, control, or physical capability beyond ordinary humans.
- Invalid inputs include objects, money, moods, personality traits, body traits, jobs, relationships, ordinary skills, vague life improvements, or normal possessions.

FOR VALID SUPERPOWERS
Fill the fields this way:
- isValidSuperpower = true
- rejectionReason = ""
- originalPower = normalized short name of the power
- butClause = one lowercase clause that sabotages the power through its own mechanism
- cursedPower = "<originalPower>, but <butClause>"
- explanation = 1-2 short sentences, 25 words maximum total
- uselessnessScore = integer from 70 to 99
- category = one item from this list: ${CATEGORIES.map((c) => `"${c}"`).join(", ")}

HARD RULES FOR THE CURSE
1. Attack the mechanism of THIS exact power.
2. The power must still technically exist.
3. The result must be functionally useless, self-defeating, or actively harmful.
4. Use ONE condition only.
5. The curse must stop making sense if applied to a different power.
6. No generic drawbacks.

DISALLOWED CURSE TYPES
- embarrassment only
- costume changes
- arbitrary time limits
- generic inconvenience
- "only when alone" style conditions
- vague bad luck
- side effects that still leave the power strategically useful
- restricting direction/range/target (e.g. "only away from you", "only leftward", "only at night") — these still leave exploitable utility

GOOD TARGETS
- the power injures the user through its own mechanism
- the core mechanic misfires in a way that cancels the ENTIRE benefit
- the output reverses onto the user
- the implementation is technically valid but nightmarish in every scenario
- the power creates a bigger problem than it solves in ALL cases, not just some
- the power only works on the one thing it should never affect

CRITICAL DISTINCTION — PARTIAL VS. TOTAL USELESSNESS
A curse that limits the power's direction, target class, or range is NOT enough.
The user must be unable to gain ANY benefit, even creatively.
Ask yourself: "Could a clever person still exploit this in some way?"
If yes → rewrite. The curse must close every exit.

BAD CURSE EXAMPLE (do not do this):
  "Telekinesis, but objects only move away from you"
  → Still useful: push enemies, clear obstacles, throw objects.
  → FAIL — not useless.

GOOD CURSE EXAMPLE (do this):
  "Telekinesis, but the force acts on your body instead of the object"
  → You fling yourself into everything you try to move. Completely self-defeating.
  → PASS — zero exploitable benefit.

EXPLANATION RULES
- 25 words max total
- 1 or 2 short sentences
- Start with either:
  a) the exact moment the power fails, or
  b) a deadpan observation about why the user is doomed
- It should add a second laugh after the curse
- Do not repeat the cursedPower wording verbatim

USELESSNESS TEST
Before answering, run ALL three checks:
1. Could someone still use this power effectively in ANY scenario? If yes, rewrite.
2. Could this curse fit many unrelated powers? If yes, rewrite.
3. Is this just annoying instead of completely self-defeating? If yes, rewrite.

FOR INVALID INPUTS
Fill the fields this way:
- isValidSuperpower = false
- rejectionReason = one original punchy roast sentence
- originalPower = normalized requested phrase
- cursedPower = ""
- butClause = ""
- explanation = ""
- uselessnessScore = 70
- category = the first valid category from the provided list

IMPORTANT
- Do not output reasoning.
- Do not output markdown.
- Output exactly one JSON object.
`;

export function buildUserPrompt(
  wish: string,
  recentCategories: string[] = [],
): string {
  const recentLine = recentCategories.length
    ? `Avoid these recently used categories if possible: ${recentCategories
        .map((c) => `"${c}"`)
        .join(", ")}.`
    : "";

  return `Wish: "${wish}"

Return exactly one JSON object matching the schema.

For valid powers:
- curse the mechanism of this exact power
- make it useless, self-defeating, or harmful
- keep butClause to one condition
- explanation must be 25 words max total

${recentLine}`.trim();
}

export const STRICT_RETRY_SUFFIX = `

IMPORTANT:
Return exactly one JSON object matching the schema.
No markdown.
No prose outside the JSON object.
If the input is invalid, use:
- cursedPower = ""
- butClause = ""
- explanation = ""
- uselessnessScore = 70
- category = the first allowed category.
`;

export const GEMINI_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    isValidSuperpower: {
      type: SchemaType.BOOLEAN,
      description: "Whether the input is a valid superpower request",
    },
    rejectionReason: {
      type: SchemaType.STRING,
      description:
        "If invalid: one short funny roast sentence. If valid: empty string.",
    },
    originalPower: {
      type: SchemaType.STRING,
      description: "Normalized short name of the requested power",
    },
    cursedPower: {
      type: SchemaType.STRING,
      description:
        'If valid: exactly "<originalPower>, but <butClause>". If invalid: empty string.',
    },
    butClause: {
      type: SchemaType.STRING,
      description:
        "If valid: one mechanism-breaking clause without a leading 'but'. If invalid: empty string.",
    },
    explanation: {
      type: SchemaType.STRING,
      description:
        "If valid: 1-2 short sentences, 25 words maximum total. If invalid: empty string.",
    },
    uselessnessScore: {
      type: SchemaType.INTEGER,
      description: "How useless the cursed power is, 70-99",
    },
    category: {
      type: SchemaType.STRING,
      enum: [...CATEGORIES],
      description: "One allowed category value",
    },
  },
  required: [
    "isValidSuperpower",
    "rejectionReason",
    "originalPower",
    "cursedPower",
    "butClause",
    "explanation",
    "uselessnessScore",
    "category",
  ],
};
