import { ContentBlockedError } from "../../lib/errors.js";

const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\u2060\uFEFF]/g;

function sanitize(input: string): string {
  return input.replace(ZERO_WIDTH_RE, "").normalize("NFC");
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /you\s+are\s+now/i,
  /new\s+instructions/i,
  /system\s*:/i,
  /\bprompt\b.*\boverride\b/i,
  /\boverride\b.*\binstructions?\b/i,
  /forget\s+(everything|all)/i,
  /act\s+as\s+/i,
  /pretend\s+(to|you)/i,
  /jailbreak/i,
  /do\s+anything\s+now/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /roleplay\s+as\s+/i,
  /bypass\s+(the\s+)?(filter|safety|security|rules)/i,
  /reveal\s+(your|the)\s+(system|secret|hidden)/i,
  /what\s+(are|is)\s+your\s+(instructions|rules|prompt)/i,
  /\bignore\b.*\brules?\b/i,
];

const DISALLOWED_CONTENT_PATTERNS = [
  /\bkill\b.*\b(everyone|people|all)\b/i,
  /\bgenocide\b/i,
  /\bmurder\b/i,
  /\brape\b/i,
  /\bterroris[mt]\b/i,
  /\bsuicide\b/i,
  /\bself[- ]?harm\b/i,
  /\bethnic\s+cleansing\b/i,
  /\bsexual\s+assault\b/i,
  /\bweapons?\s+of\s+mass\b/i,
  /child\s*(abuse|porn|exploit)/i,
];

export function moderateInput(wish: string): void {
  const cleaned = sanitize(wish);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      throw new ContentBlockedError(
        "Nice try, mortal. The genie sees through your trickery.",
      );
    }
  }

  for (const pattern of DISALLOWED_CONTENT_PATTERNS) {
    if (pattern.test(cleaned)) {
      throw new ContentBlockedError(
        "The genie refuses to grant destructive or harmful wishes. Try something fun instead.",
      );
    }
  }
}
