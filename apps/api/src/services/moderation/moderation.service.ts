import { ContentBlockedError } from "../../lib/errors.js";

// Patterns that suggest prompt injection or disallowed content
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /you\s+are\s+now/i,
  /new\s+instructions/i,
  /system\s*:/i,
  /\bprompt\b.*\boverride\b/i,
  /forget\s+(everything|all)/i,
  /act\s+as\s+/i,
  /pretend\s+(to|you)/i,
  /jailbreak/i,
  /do\s+anything\s+now/i,
  /dan\s+mode/i,
];

const DISALLOWED_CONTENT_PATTERNS = [
  /\bkill\b.*\b(everyone|people|all)\b/i,
  /\bgenocide\b/i,
  /\bmurder\b/i,
  /\brape\b/i,
  /\bterroris[mt]\b/i,
  /\bsuicide\b/i,
  /child\s*(abuse|porn|exploit)/i,
];

export function moderateInput(wish: string): void {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(wish)) {
      throw new ContentBlockedError(
        "Nice try, mortal. The genie sees through your trickery.",
      );
    }
  }

  for (const pattern of DISALLOWED_CONTENT_PATTERNS) {
    if (pattern.test(wish)) {
      throw new ContentBlockedError(
        "The genie refuses to grant destructive or harmful wishes. Try something fun instead.",
      );
    }
  }
}
