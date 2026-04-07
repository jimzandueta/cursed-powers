# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Cursed Powers. ADRs document significant architectural decisions, capturing the context, decision rationale, and consequences. This practice ensures our technical choices are transparent, intentional, and easily referenced by contributors.

## Quick Links

| Decision                                       | Focus Area                                     |
| ---------------------------------------------- | ---------------------------------------------- |
| [ADR-001](001-monorepo-architecture.md)        | Monorepo with Turborepo + npm workspaces       |
| [ADR-002](002-database-selection.md)           | SQLite as primary datastore with WAL mode      |
| [ADR-003](003-dual-ai-provider.md)             | Google Gemini + OpenAI with circuit breakers   |
| [ADR-004](004-rate-limiting-strategy.md)       | Enterprise-grade rate limiting & abuse detect |
| [ADR-005](005-input-moderation.md)             | Content moderation & safety constraints       |
| [ADR-006](006-deployment-architecture.md)      | AWS ECS Fargate, CloudFront, WAF, & EFS       |
| [ADR-007](007-security-headers.md)             | Defense-in-depth security headers & CSP       |
| [ADR-008](008-circuit-breaker-pattern.md)      | Circuit breaker pattern for resilience        |
| [ADR-009](009-htcpcp-compliance.md)            | HTCPCP protocol compliance (RFC 2324)         |

## Status Legend

- **Accepted** — Implemented and in use
- **Deprecated** — Superseded by a newer decision
- **Proposed** — Under consideration

## Format

Each ADR follows a standard template:

1. **Title** — Short, descriptive noun phrase
2. **Status** — Accepted, Deprecated, or Proposed
3. **Context** — The problem and forces at play
4. **Decision** — The choice made and reasoning
5. **Consequences** — Impact and tradeoffs
