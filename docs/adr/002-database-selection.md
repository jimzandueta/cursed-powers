# ADR-002: SQLite as Primary Datastore

**Status:** Accepted  
**Date:** 2026-04-01  
**Deciders:** Data Architecture Working Group  
**Technical Story:** CURSED-47

## Context

The Cursed Powers platform requires persistent storage for user-submitted wishes, their cursed transformations, and associated metadata (generation time, AI model version, content moderation flags). The data model is relational in nature with well-defined schemas.

The team evaluated:

1. **PostgreSQL** — Industry-standard RDBMS
2. **SQLite** — Embedded relational database
3. **MongoDB** — Document-oriented NoSQL
4. **DynamoDB** — AWS managed NoSQL

Our data access patterns are:

- Write-heavy during peak wish submission periods
- Read-heavy for the gallery/browse experience
- No complex joins beyond single-table queries
- Expected dataset size: <10GB (wishes are text-only)

## Decision

We will use **SQLite** via **better-sqlite3** as the primary datastore, with **Drizzle ORM** as the query builder and schema management layer.

Configuration includes:

- WAL (Write-Ahead Logging) mode for concurrent read/write performance
- Foreign key enforcement enabled
- Auto-migration on startup for schema evolution

## Rationale

- **Zero operational overhead**: No database server to manage, monitor, or patch. The database is a single file on the filesystem.
- **Performance**: better-sqlite3 provides synchronous, zero-copy access. Single-digit microsecond reads are standard.
- **Deployment simplicity**: The database file travels with the application. No connection strings, no network latency, no connection pooling configuration.
- **Cost**: $0/month in database hosting fees, which is particularly relevant for a platform whose primary value proposition is generating useless superpowers.
- **Drizzle ORM**: Type-safe schema definitions, automatic migration detection, and a query builder that maps directly to SQL (no ORM magic).

## Consequences

### Positive

- Sub-millisecond query latency for all operations
- No external service dependencies for data persistence
- Database can be backed up with a single `cp` command
- Full ACID compliance with WAL mode

### Negative

- Horizontal scaling requires architectural changes (single-writer limitation)
- No built-in replication or failover
- ECS Fargate deployment requires EFS volume mount for data persistence (see ADR-006)
- Cannot leverage managed database features (automated backups, point-in-time recovery)

### Risks

- Data loss if EFS volume is misconfigured (mitigated: Terraform manages EFS lifecycle; automated backup policy in place)
- Write contention under extreme load (mitigated: WAL mode supports concurrent reads; write volume is bounded by rate limiting — see ADR-004)
