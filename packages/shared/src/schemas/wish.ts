import { z } from "zod";

export const WISH_MIN_LENGTH = 2;
export const WISH_MAX_LENGTH = 200;

export const CATEGORIES = [
  "Technically True",
  "Cosmically Unfair",
  "Painfully Specific",
  "Existentially Cruel",
  "Aggressively Useless",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CreateWishSchema = z.object({
  wish: z
    .string()
    .trim()
    .min(WISH_MIN_LENGTH, "Your wish is too short, mortal.")
    .max(
      WISH_MAX_LENGTH,
      `Wishes must be under ${WISH_MAX_LENGTH} characters.`,
    ),
  turnstileToken: z.string().optional(),
  /** Honeypot field — invisible to real users, auto-filled by bots */
  website: z.string().max(0, "Nice try, bot.").optional().default(""),
});

export type CreateWishInput = z.infer<typeof CreateWishSchema>;

export const GeminiWishResponseSchema = z.object({
  isValidSuperpower: z.boolean(),
  rejectionReason: z.string().optional().default(""),
  originalPower: z.string().optional().default(""),
  cursedPower: z.string().optional().default(""),
  butClause: z.string().optional().default(""),
  explanation: z.string().optional().default(""),
  uselessnessScore: z.number().int().min(0).max(100).optional().default(85),
  category: z
    .string()
    .optional()
    .default("Technically True")
    .pipe(z.enum(CATEGORIES).catch("Technically True")),
});

export type GeminiWishResponse = z.infer<typeof GeminiWishResponseSchema>;

export const WishResultSchema = z.object({
  id: z.string(),
  originalWish: z.string(),
  cursedPower: z.string(),
  butClause: z.string(),
  explanation: z.string(),
  uselessnessScore: z.number(),
  category: z.enum(CATEGORIES),
  createdAt: z.string(),
});

export type WishResult = z.infer<typeof WishResultSchema>;

export const WishListResponseSchema = z.object({
  wishes: z.array(WishResultSchema),
  total: z.number(),
  page: z.number(),
});

export type WishListResponse = z.infer<typeof WishListResponseSchema>;

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
  }),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  timestamp: z.string(),
});
