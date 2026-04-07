# ADR-004: Enterprise Rate Limiting Strategy

**Status:** Accepted  
**Date:** 2026-04-02  
**Deciders:** Security Engineering, Platform Architecture  
**Technical Story:** CURSED-61

## Context

The Cursed Powers API is publicly accessible and consumes expensive AI provider tokens on every wish generation request. Without rate limiting, a single malicious actor could:

1. Exhaust our AI provider API quotas
2. Generate thousands of wishes, inflating our billing
3. Perform a denial-of-service attack against the platform
4. Scrape the entire wish gallery

The platform must balance accessibility (users should be able to make wishes freely) with protection against abuse.

## Decision

We will implement **multi-layer rate limiting** using `@fastify/rate-limit`:

### Layer 1: Global Rate Limit

- **Maximum**: 100 requests per 15-minute window per IP address
- **Applies to**: All endpoints
- **Key generator**: Client IP address (via `request.ip`)

### Layer 2: Wish Generation Rate Limit

- **Maximum**: 10 wish generations per 15-minute window per IP address
- **Applies to**: `POST /api/v1/wishes`
- **Rationale**: AI generation is the most expensive operation

### Response

Rate-limited requests receive HTTP 429 with a themed response:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "The genie needs rest. Try again in a moment.",
    "requestId": "wish_abc123"
  }
}
```

## Rationale

- **Cost protection**: Each wish generation costs approximately $0.001-0.003 in AI tokens. At scale, uncontrolled access could result in significant billing.
- **Fair usage**: Rate limiting ensures equitable access across all users.
- **DDoS mitigation**: First line of defense before WAF rules (see ADR-006 for CloudFront + WAF).
- **In-memory implementation**: No external Redis dependency. Rate limit state is per-process, which is acceptable for a single-instance deployment.

## Consequences

### Positive

- AI provider costs are bounded and predictable
- Platform remains available during traffic spikes
- Simple implementation with no external dependencies

### Negative

- In-memory store resets on restart (acceptable: rate limits are short-lived)
- IP-based limiting can affect users behind shared NATs (mitigated: generous limits)
- No distributed rate limiting across multiple instances (acceptable: single-instance architecture)

### Risks

- IP spoofing via X-Forwarded-For (mitigated: Fastify's `trustProxy` configuration behind ALB)
