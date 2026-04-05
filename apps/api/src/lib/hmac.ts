import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const MAX_AGE_SECONDS = 30;

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: string, message: string): string {
  return createHmac("sha256", key).update(message).digest("hex");
}

export function verifyRequestSignature(
  method: string,
  path: string,
  body: string | undefined,
  timestamp: string | undefined,
  signature: string | undefined,
  secret: string,
): { valid: boolean; reason?: string } {
  if (!timestamp || !signature) {
    return { valid: false, reason: "Missing signature headers" };
  }

  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) {
    return { valid: false, reason: "Invalid timestamp" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_AGE_SECONDS) {
    return { valid: false, reason: "Request expired" };
  }

  const bodyHash = body ? sha256(body) : "";
  const message = `${timestamp}.${method.toUpperCase()}.${path}.${bodyHash}`;
  const expected = hmacSha256(secret, message);

  if (expected.length !== signature.length) {
    return { valid: false, reason: "Invalid signature" };
  }

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) {
    return { valid: false, reason: "Invalid signature" };
  }

  const isValid = timingSafeEqual(a, b);
  return isValid
    ? { valid: true }
    : { valid: false, reason: "Invalid signature" };
}
