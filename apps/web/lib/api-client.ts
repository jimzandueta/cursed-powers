import type { WishResult, ApiError } from "@cursed-wishes/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function createWish(wish: string): Promise<WishResult> {
  const res = await fetch(`${API_URL}/api/v1/wishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wish }),
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
