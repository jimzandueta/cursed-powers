# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Cursed Powers platform.

ADRs are numbered sequentially and document significant architectural decisions made during the lifecycle of the project. Each record captures the context, decision, and consequences of a particular choice.

## Index

| ADR                                       | Title                             | Status   | Date       |
| ----------------------------------------- | --------------------------------- | -------- | ---------- |
| [ADR-001](001-monorepo-architecture.md)   | Monorepo Architecture             | Accepted | 2026-04-01 |
| [ADR-002](002-database-selection.md)      | SQLite as Primary Datastore       | Accepted | 2026-04-01 |
| [ADR-003](003-dual-ai-provider.md)        | Dual AI Provider Strategy         | Accepted | 2026-04-02 |
| [ADR-004](004-rate-limiting-strategy.md)  | Enterprise Rate Limiting Strategy | Accepted | 2026-04-02 |
| [ADR-005](005-input-moderation.md)        | Input Moderation Pipeline         | Accepted | 2026-04-03 |
| [ADR-006](006-deployment-architecture.md) | AWS ECS Fargate Deployment        | Accepted | 2026-04-04 |
| [ADR-007](007-security-headers.md)        | Defense-in-Depth Security Headers | Accepted | 2026-04-05 |
| [ADR-008](008-circuit-breaker-pattern.md) | Circuit Breaker Pattern           | Accepted | 2026-04-06 |
| [ADR-009](009-htcpcp-compliance.md)       | HTCPCP Protocol Compliance        | Accepted | 2026-04-07 |

## Format

Each ADR follows the format established by Michael Nygard:

1. **Title** — A short noun phrase
2. **Status** — Proposed, Accepted, Deprecated, or Superseded
3. **Context** — The forces at play
4. **Decision** — The response to those forces
5. **Consequences** — The resulting context after applying the decision
