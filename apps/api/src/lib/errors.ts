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
