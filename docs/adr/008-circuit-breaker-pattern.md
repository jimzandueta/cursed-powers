# ADR-008: Circuit Breaker Pattern for AI Providers

**Status:** Accepted  
**Date:** 2026-04-06  
**Deciders:** Reliability Engineering, Platform Architecture  
**Technical Story:** CURSED-92

## Context

The Cursed Powers platform depends on external AI providers (Gemini, OpenAI) for its core functionality. These providers occasionally experience:

- Elevated latency (>5s response times)
- Rate limit exhaustion (HTTP 429)
- Temporary outages (HTTP 500/503)
- Network timeouts

Without fault isolation, a degraded AI provider can cause cascading failures: request threads block waiting for timeouts, connection pools are exhausted, and the entire API becomes unresponsive — even for non-AI endpoints like health checks and the wish gallery.

## Decision

We will implement the **Circuit Breaker pattern** (as described by Michael Nygard in _Release It!_) for each AI provider.

### State Machine

```
     success
  ┌───────────┐
  ▼           │
CLOSED ──────► OPEN ──────► HALF_OPEN
  ▲    failure   │  cooldown    │
  │    threshold │    timer     │
  └──────────────┴──────────────┘
        success on probe
```

### Configuration

| Parameter         | Value                       | Rationale                     |
| ----------------- | --------------------------- | ----------------------------- |
| Failure threshold | 3 consecutive failures      | Tolerates transient errors    |
| Cooldown period   | 30 seconds                  | Allows provider recovery time |
| Probe strategy    | Single request in HALF_OPEN | Minimal load during recovery  |

### Behavior by State

| State         | Behavior                                                                |
| ------------- | ----------------------------------------------------------------------- |
| **CLOSED**    | Requests flow normally. Failures increment counter.                     |
| **OPEN**      | All requests immediately fail with circuit breaker error. Timer starts. |
| **HALF_OPEN** | One probe request allowed. Success → CLOSED. Failure → OPEN.            |

### Metrics Exposed

Each circuit breaker exposes real-time metrics via the health endpoint:

- Current state
- Consecutive failure count
- Total requests / successes / failures
- Last failure and success timestamps

## Rationale

- **Fail fast**: When a provider is down, returning an error in <1ms is better than waiting 30s for a timeout
- **Self-healing**: The HALF_OPEN state automatically tests recovery without manual intervention
- **Observability**: Circuit breaker metrics in the health endpoint enable proactive monitoring
- **Per-provider isolation**: Gemini outage does not affect OpenAI circuit, enabling clean failover

## Consequences

### Positive

- Cascading failures are prevented during provider outages
- Health endpoint provides real-time circuit breaker state for monitoring
- Automatic recovery without operator intervention
- Clear error messages when circuit is open

### Negative

- Additional complexity in the request path
- In-memory state resets on process restart (acceptable: breakers start CLOSED)
- Threshold tuning may require iteration based on production traffic patterns

### Risks

- Aggressive thresholds could open circuit on transient errors (mitigated: 3-failure threshold is generous)
- Timer-based recovery may not align with actual provider recovery (mitigated: 30s cooldown is conservative)
