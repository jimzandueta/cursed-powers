import { createHash } from "node:crypto";

interface RequestRecord {
  timestamps: number[];
  wishHashes: string[];
  abuseScore: number;
  lastDecay: number;
}

interface AbuseDetectorConfig {
  /** Max requests within `rapidWindowMs` before scoring (default 5) */
  rapidThreshold: number;
  /** Sliding window for rapid-fire detection in ms (default 10_000) */
  rapidWindowMs: number;
  /** Score above which a request is blocked (default 10) */
  blockThreshold: number;
  /** Interval at which scores halve in ms (default 300_000 = 5min) */
  decayIntervalMs: number;
  /** Max tracked IPs before evicting oldest (default 10_000) */
  maxTrackedIps: number;
}

const DEFAULTS: AbuseDetectorConfig = {
  rapidThreshold: 5,
  rapidWindowMs: 10_000,
  blockThreshold: 10,
  decayIntervalMs: 300_000,
  maxTrackedIps: 10_000,
};

export class AbuseDetector {
  private records = new Map<string, RequestRecord>();
  private config: AbuseDetectorConfig;

  constructor(config: Partial<AbuseDetectorConfig> = {}) {
    this.config = { ...DEFAULTS, ...config };
  }

  private hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 16);
  }

  private hashWish(wish: string): string {
    return createHash("sha256")
      .update(wish.trim().toLowerCase())
      .digest("hex")
      .slice(0, 12);
  }

  private evictIfNeeded(): void {
    if (this.records.size <= this.config.maxTrackedIps) return;
    const oldest = this.records.keys().next().value;
    if (oldest !== undefined) this.records.delete(oldest);
  }

  private decay(record: RequestRecord, now: number): void {
    const elapsed = now - record.lastDecay;
    if (elapsed >= this.config.decayIntervalMs) {
      const halvings = Math.floor(elapsed / this.config.decayIntervalMs);
      record.abuseScore = record.abuseScore / Math.pow(2, halvings);
      record.lastDecay = now;
    }
  }

  /**
   * Record a request and return whether it should be blocked.
   *
   * Scoring signals:
   * +3  rapid-fire (>threshold requests within window)
   * +2  repeated identical wish (exact same payload hash)
   * +1  missing User-Agent header
   * +1  missing Accept header
   */
  recordRequest(
    ip: string,
    wish?: string,
    headers?: { userAgent?: string; accept?: string },
  ): { blocked: boolean; score: number } {
    const key = this.hashIp(ip);
    const now = Date.now();

    let record = this.records.get(key);
    if (!record) {
      this.evictIfNeeded();
      record = {
        timestamps: [],
        wishHashes: [],
        abuseScore: 0,
        lastDecay: now,
      };
      this.records.set(key, record);
    }

    this.decay(record, now);

    const windowStart = now - this.config.rapidWindowMs;
    record.timestamps = record.timestamps.filter((t) => t >= windowStart);
    record.timestamps.push(now);

    let scoreIncrease = 0;

    if (record.timestamps.length > this.config.rapidThreshold) {
      scoreIncrease += 3;
    }

    if (wish) {
      const wishHash = this.hashWish(wish);
      if (record.wishHashes.includes(wishHash)) {
        scoreIncrease += 2;
      }
      record.wishHashes.push(wishHash);
      if (record.wishHashes.length > 20) {
        record.wishHashes = record.wishHashes.slice(-20);
      }
    }

    if (!headers?.userAgent) scoreIncrease += 1;
    if (!headers?.accept) scoreIncrease += 1;

    record.abuseScore += scoreIncrease;

    return {
      blocked: record.abuseScore >= this.config.blockThreshold,
      score: record.abuseScore,
    };
  }

  reset(): void {
    this.records.clear();
  }

  get trackedIpCount(): number {
    return this.records.size;
  }
}
