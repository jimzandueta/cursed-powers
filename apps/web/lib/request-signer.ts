const SIGNING_KEY =
  process.env.NEXT_PUBLIC_REQUEST_SIGNING_KEY || "cursed-genie-default-key";

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signRequest(
  method: string,
  path: string,
  body?: string,
): Promise<{ "X-Request-Timestamp": string; "X-Request-Signature": string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = body ? await sha256(body) : "";
  const message = `${timestamp}.${method.toUpperCase()}.${path}.${bodyHash}`;
  const signature = await hmacSha256(SIGNING_KEY, message);
  return {
    "X-Request-Timestamp": timestamp,
    "X-Request-Signature": signature,
  };
}
