import { nanoid } from "nanoid";

export function generateWishId(): string {
  return `w_${nanoid(8)}`;
}

export function generateRequestId(): string {
  return `req_${nanoid(10)}`;
}
