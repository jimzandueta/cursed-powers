import type { WishResult, ApiError } from "@cursed-wishes/shared";
import { signRequest } from "./request-signer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function createWish(
  wish: string,
  turnstileToken?: string,
): Promise<WishResult> {
  const path = "/api/v1/wishes";
  const body = JSON.stringify({ wish, turnstileToken });
  const signatureHeaders = await signRequest("POST", path, body);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...signatureHeaders,
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = data as ApiError;
    throw new WishApiError(
      res.status,
      error.error?.code || "UNKNOWN",
      error.error?.message || "Something went wrong",
    );
  }

  return data as WishResult;
}

export async function fetchWish(id: string): Promise<WishResult> {
  const res = await fetch(`${API_URL}/api/v1/wishes/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new WishApiError(res.status, "NOT_FOUND", "Wish not found");
  }
  return res.json();
}

export class WishApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "WishApiError";
  }
}
