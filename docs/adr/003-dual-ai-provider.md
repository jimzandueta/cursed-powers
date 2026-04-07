# ADR-003: Dual AI Provider Strategy

**Status:** Accepted  
**Date:** 2026-04-02  
**Deciders:** AI/ML Platform Team, Reliability Engineering  
**Technical Story:** CURSED-53

## Context

The core value proposition of the Cursed Powers platform depends entirely on AI-generated content. A single AI provider outage would render the platform completely non-functional — users would be unable to receive their cursed superpowers, which, while arguably not a loss, would degrade the user experience.

The team evaluated provider reliability data:

- **Google Gemini**: 99.9% uptime SLA (GA models)
- **OpenAI GPT**: 99.5% uptime SLA (standard tier)
- **Anthropic Claude**: Not evaluated due to rate limits on free tier

Combined availability with independent failover: 1 - (0.001 × 0.005) = 99.9999% theoretical uptime.

## Decision

We will implement a **dual AI provider architecture** with Google Gemini 2.5 Pro as the primary provider and OpenAI GPT-4.1-mini as the secondary.

Both providers:

- Share an identical system prompt (maintained in a single source of truth)
- Use structured output (JSON schema) for consistent response formatting
- Expose circuit breaker metrics via the health endpoint (see ADR-008)

The provider selection logic:

1. Select provider based on configured API key (Gemini preferred if both set)
2. Attempt generation with selected provider (up to 2 tries with stricter retry prompt)
3. If both attempts fail, return a random pre-written fallback wish

## Rationale

- **Five-nines availability** for a service that generates useless superpowers is exactly the kind of engineering rigor this platform demands.
- **Cost optimization**: Gemini 2.5 Pro is significantly cheaper per token than GPT-4.1-mini. Using it as primary reduces operational costs while maintaining quality.
- **Model diversity**: Different models produce different curse styles, increasing output variety for repeated wishes.
- **No vendor lock-in**: The shared prompt interface means providers can be swapped or added with minimal code changes.

## Consequences

### Positive

- Near-zero downtime for AI generation capability
- Cost-optimized by routing to cheaper provider first
- Health endpoint exposes circuit breaker metrics for monitoring
- Hardcoded fallback wishes ensure graceful degradation even when both providers fail

### Negative

- Two API key sets to manage and rotate
- Subtle output differences between providers (mitigated: shared prompt engineering and structured output schema)
- Increased complexity in error handling and logging
- Two billing relationships to maintain for a free application

### Risks

- Prompt drift between providers (mitigated: single prompt source, shared Zod schema validation)
- Rate limit exhaustion on fallback during primary outage (mitigated: separate rate limit budgets per provider)
