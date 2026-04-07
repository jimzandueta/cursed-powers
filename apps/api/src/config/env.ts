import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    DATABASE_URL: z.string().default("file:./data/wishes.db"),
    GEMINI_API_KEY: z.string().optional().default(""),
    OPENAI_API_KEY: z.string().optional().default(""),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    RATE_LIMIT_MAX: z.coerce.number().default(50),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(14_400_000),
    TURNSTILE_SECRET_KEY: z.string().optional().default(""),
    REQUEST_SIGNING_KEY: z.string().optional().default("cursed-genie-default-key"),
    TRUST_PROXY: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  })
  .refine((data) => data.GEMINI_API_KEY || data.OPENAI_API_KEY, {
    message: "At least one of GEMINI_API_KEY or OPENAI_API_KEY must be provided",
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
