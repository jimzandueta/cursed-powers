export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotASuperpowerError extends AppError {
  constructor(message: string = "That's not a superpower, mortal. Try again.") {
    super(422, "NOT_A_SUPERPOWER", message);
  }
}

export class ContentBlockedError extends AppError {
  constructor(message: string = "The genie refuses this wish.") {
    super(422, "CONTENT_BLOCKED", message);
  }
}

export class GenerationFailedError extends AppError {
  constructor(message: string = "The genie's magic is unstable. Try again.") {
    super(500, "GENERATION_FAILED", message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, "VALIDATION_ERROR", message);
  }
}

const TEAPOT_MESSAGES = [
  "HTTP 418: I'm a teapot, not a genie. ...okay, I'm both. But I'm not granting that.",
  "The genie is also a teapot. Per RFC 2324, I must refuse to brew coffee. And wishes about beverages.",
  "Error 418: I'm a teapot. I may be trapped in a lamp, but I know my HTTP status codes.",
  "This wish has been rejected per the Hyper Text Coffee Pot Control Protocol. I don't make the rules.",
  "418 I'm a Teapot. The genie-teapot coalition has unanimously voted to deny this wish.",
  "RFC 2324 Section 2.3.2: Any attempt to brew coffee with a teapot should result in the error code 418. Any attempt to wish for beverages from a genie should result in... also 418.",
  "I'm short, I'm stout, and I'm returning a 418. Tip me over, pour me out — still not granting that.",
  "The genie has detected a beverage-related wish and must comply with HTCPCP. Your wish has been steeped in rejection.",
];

export class TeapotError extends AppError {
  constructor(message?: string) {
    super(
      418,
      "IM_A_TEAPOT",
      message ??
        TEAPOT_MESSAGES[Math.floor(Math.random() * TEAPOT_MESSAGES.length)],
    );
  }
}
