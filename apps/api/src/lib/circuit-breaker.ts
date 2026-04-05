type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms to wait before transitioning from OPEN to HALF_OPEN */
  cooldownMs: number;
  /** Name for logging purposes */
  name: string;
}

interface CircuitBreakerMetrics {
  state: CircuitState;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChangedAt: number;
}

type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private consecutiveFailures = 0;
  private totalRequests = 0;
  private totalFailures = 0;
  private totalSuccesses = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private stateChangedAt = Date.now();
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }

  async execute<T>(fn: () => Promise<T>, logger: Logger): Promise<T> {
    this.totalRequests++;

    if (this.state === "OPEN") {
      if (Date.now() - this.stateChangedAt >= this.options.cooldownMs) {
        this.transitionTo("HALF_OPEN", logger);
      } else {
        logger.warn(
          { circuit: this.options.name, state: this.state },
          "Circuit breaker OPEN — fast-failing request",
        );
        throw new Error(
          `Circuit breaker [${this.options.name}] is OPEN. Request rejected.`,
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess(logger);
      return result;
    } catch (err) {
      this.onFailure(logger);
      throw err;
    }
  }

  private onSuccess(logger: Logger): void {
    this.totalSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = Date.now();

    if (this.state === "HALF_OPEN") {
      this.transitionTo("CLOSED", logger);
    }
  }

  private onFailure(logger: Logger): void {
    this.totalFailures++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (
      this.consecutiveFailures >= this.options.failureThreshold &&
      this.state !== "OPEN"
    ) {
      this.transitionTo("OPEN", logger);
    }
  }

  private transitionTo(newState: CircuitState, logger: Logger): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    logger.info(
      {
        circuit: this.options.name,
        from: oldState,
        to: newState,
        consecutiveFailures: this.consecutiveFailures,
        totalRequests: this.totalRequests,
      },
      `Circuit breaker [${this.options.name}] state transition: ${oldState} → ${newState}`,
    );
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
    };
  }
}

export const geminiCircuitBreaker = new CircuitBreaker({
  name: "gemini-ai",
  failureThreshold: 3,
  cooldownMs: 30_000,
});

export const openaiCircuitBreaker = new CircuitBreaker({
  name: "openai-ai",
  failureThreshold: 3,
  cooldownMs: 30_000,
});
