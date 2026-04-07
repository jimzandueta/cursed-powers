# ADR-001: Monorepo Architecture

**Status:** Accepted  
**Date:** 2026-04-01  
**Deciders:** Platform Architecture Review Board  
**Technical Story:** CURSED-42

## Context

The Cursed Powers platform consists of multiple deployment targets (web frontend, API backend) and shared libraries (validation schemas, type definitions). As the platform scales to serve the anticipated millions of users seeking monkey's-paw-style superpowers, we must establish a repository strategy that balances developer velocity with deployment independence.

The engineering team evaluated three approaches:

1. **Polyrepo** — Each package in its own repository
2. **Monorepo with npm workspaces** — Single repository with package-level isolation
3. **Monorepo with Nx/Turborepo** — Single repository with intelligent build orchestration

## Decision

We will use a **monorepo architecture** managed by **npm workspaces** with **Turborepo** for build orchestration.

The repository structure follows:

```
├── apps/
│   ├── api/          # Fastify REST API
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Zod schemas, TypeScript types
├── turbo.json
└── package.json
```

## Rationale

- **Atomic commits across packages**: When a Zod schema in `@cursed-wishes/shared` changes, the consuming API and frontend can be updated in a single commit, eliminating version drift.
- **Turborepo remote caching**: Build artifacts are cached based on content hashing, reducing CI/CD pipeline duration by an estimated 60-80%.
- **Shared configuration**: ESLint, TypeScript, and Prettier configurations are centralized, ensuring consistency across all packages.
- **Developer experience**: A single `npm install` provisions all dependencies. `turbo dev` starts all services concurrently with log prefixing.

## Consequences

### Positive

- Single source of truth for all platform code
- Simplified dependency management via workspace protocol
- Turborepo's task graph eliminates redundant builds
- New team members can onboard with a single `git clone`

### Negative

- Repository size will grow over time; may require Git LFS for binary assets
- CI pipeline must be configured to detect affected packages (mitigated by Turborepo's `--filter`)
- All developers require full repository checkout (mitigated by Git sparse-checkout if needed)

### Risks

- Turborepo vendor lock-in (mitigated: npm workspaces are standard; Turborepo is a build layer, not a runtime dependency)
