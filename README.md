# Cursed Powers

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![HTCPCP Compliant](https://img.shields.io/badge/HTCPCP-RFC%202324%20Compliant-blueviolet)](https://datatracker.ietf.org/doc/html/rfc2324)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC)](infra/terraform/)
[![ADRs](https://img.shields.io/badge/docs-9%20ADRs-informational)](docs/adr/)

> **Every superpower has a catch™**

Cursed Powers is a full-stack web application that combines AI with interactive storytelling. Users rub a magic lamp to summon a genie, make a superpower wish, and receive a hilariously cursed interpretation of their wish powered by AI.

The engineering is production-grade. The usefulness is thoroughly cursed.

## Features

- **Interactive Lamp Experience**: Animated lamp-rubbing interface that triggers genie summoning
- **Dual AI Providers**: Fallback-capable integration with Google Gemini 2.5 Flash and OpenAI GPT-4o-mini
- **Security-First Backend**: Rate limiting, abuse detection, request signing, CAPTCHA verification, and content moderation
- **Real-Time Results**: WebSocket-ready architecture with progressive result streaming
- **Enterprise Deployment**: Production-ready infrastructure with AWS ECS Fargate, CloudFront CDN, WAF, and automated scaling
- **Comprehensive Testing**: 192 unit tests (100% API coverage) + 14 E2E browser tests
- **Type-Safe**: 100% TypeScript with strict mode across frontend and backend

## Architecture

```
                         ┌──────────────────────────────┐
                         │        CloudFront CDN        │
                         │     + WAF (4 rule groups)    │
                         └──────────────┬───────────────┘
                                        │
                         ┌──────────────▼─────────────────┐
                         │     Application Load Balancer  │
                         │   (TLS 1.3, path-based routing)│
                         └───────┬──────────────┬─────────┘
                                 │              │
                    /api/*       │              │    /*
                   ┌─────────────▼──┐   ┌──────▼────────────┐
                   │   ECS Fargate  │   │   ECS Fargate     │
                   │   Fastify API  │   │   Next.js Web     │
                   │                │   │                   │
                   │  ┌──────────┐  │   │  Security Headers │
                   │  │ Helmet   │  │   │  HSTS, CSP, etc.  │
                   │  │ Rate Lim │  │   └───────────────────┘
                   │  │ Circuit  │  │
                   │  │ Breakers │  │
                   │  └──────────┘  │
                   └───────┬────────┘
                           │
              ┌────────────▼────────────┐
              │    EFS (Encrypted)      │
              │    SQLite + WAL mode    │
              │    Daily backups        │
              └─────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
      ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼──────┐
      │  Gemini   │ │  OpenAI   │ │  OpenAI    │
      │  2.5 Flash│ │  GPT-4o   │ │  Moderation│
      │ (primary) │ │  (backup) │ │  API       │
      └───────────┘ └───────────┘ └────────────┘
```

## Stack

- **Frontend**: Next.js 15 + Tailwind CSS v4 + Framer Motion
- **Backend**: Fastify 5 + Drizzle ORM + SQLite + Helmet
- **AI**: Google Gemini 2.5 Flash / OpenAI GPT-4o-mini (with circuit breakers)
- **Infra**: Terraform (AWS ECS Fargate, CloudFront, WAF, EFS, CloudWatch)
- **Monorepo**: npm workspaces + Turborepo

## Setup

```bash
# Clone and install
git clone https://github.com/jimzandueta/cursed-powers.git
cd cursed-powers
npm install

# Copy env and add your API key (at least one required)
cp .env.example .env

# Run both frontend + backend
npm run dev
```

### With Docker

```bash
cp .env.example .env
# Edit .env with your API key(s)
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/v1/health
- Teapot: http://localhost:3001/api/v1/teapot (RFC 2324)

## Project Structure

```
├── apps/
│   ├── api/          # Fastify backend (circuit breakers, helmet, graceful shutdown)
│   └── web/          # Next.js frontend (security headers, animations)
├── packages/
│   └── shared/       # Shared Zod schemas & types
├── infra/
│   └── terraform/    # AWS infrastructure (VPC, ECS, ALB, CloudFront, WAF, EFS)
├── docs/
│   ├── adr/          # 9 Architecture Decision Records
│   ├── openapi.yaml  # OpenAPI 3.1 specification
│   ├── runbook.md    # Operations runbook
│   ├── sla.md        # Service Level Agreement
│   └── incident-response.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml    # 6-job CI pipeline (typecheck, lint, test, e2e, commitlint, gate)
│   │   └── release.yml # Tag-triggered release (validate → genie approval → Docker → GH release)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/
│   ├── pre-commit    # lint-staged (type-check + related tests)
│   ├── commit-msg    # commitlint (Conventional Commits)
│   └── pre-push      # full build + test gate
├── commitlint.config.js  # Conventional Commits rules + custom scopes
├── .lintstagedrc.json    # Staged file checks config
├── SECURITY.md       # Security policy & vuln reporting
├── docker-compose.yml
└── turbo.json
```

## API Endpoints

| Method | Path                    | Description            | Status |
| ------ | ----------------------- | ---------------------- | ------ |
| POST   | `/api/v1/wishes`        | Generate a cursed wish | 201    |
| GET    | `/api/v1/wishes/:id`    | Get a wish by ID       | 200    |
| GET    | `/api/v1/wishes`        | Gallery listing        | 200    |
| GET    | `/api/v1/wishes/random` | Random wish            | 200    |
| GET    | `/api/v1/health`        | Deep health check      | 200    |
| GET    | `/api/v1/teapot`        | HTCPCP compliance      | 418    |

## Documentation

| Document                                       | Description                                             |
| ---------------------------------------------- | ------------------------------------------------------- |
| [Architecture Decision Records](docs/adr/)     | 9 ADRs covering every major technical decision          |
| [OpenAPI Spec](docs/openapi.yaml)              | Full API specification                                  |
| [SLA](docs/sla.md)                             | Service Level Agreement (with wish-denominated credits) |
| [Runbook](docs/runbook.md)                     | Operations runbook for on-call engineers                |
| [Incident Response](docs/incident-response.md) | SEV-1 through SEV-4 procedures                          |
| [Security Policy](SECURITY.md)                 | Vulnerability reporting & security architecture         |
| [Terraform](infra/terraform/)                  | Fully deployable AWS infrastructure                     |

## Environment Variables

See `.env.example` for all required variables. At least one of `GEMINI_API_KEY` or `OPENAI_API_KEY` is required. Gemini takes priority if both are set.

## Git Workflow

This project enforces an enterprise-grade git workflow because even a cursed wish generator deserves governance.

### Conventional Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/). Enforced via [commitlint](https://commitlint.js.org/) + Husky `commit-msg` hook.

```bash
# ✅ Valid commits
feat(api): add wish expiration policy
fix(genie): stop granting actual useful powers
docs(teapot): update HTCPCP compliance matrix
test(wishes): verify curse delivery at 100% coverage
chore(deps): bump drizzle-orm to 0.40.0
refactor(lamp): optimize rubbing detection algorithm
ci(docker): add multi-platform build support

# ❌ Rejected commits
yolo                    # No type
fix: stuff              # Scope recommended
FIX(api): thing         # Type must be lowercase
feat(api): Add thing.   # No capital, no period
```

**Allowed scopes**: `api`, `web`, `shared`, `infra`, `docs`, `deps`, `ci`, `docker`, `terraform`, `genie`, `lamp`, `wishes`, `teapot`, `curses`, `htcpcp`, `circuit-breaker`, `moderation`

### Git Hooks (Husky)

| Hook       | Action                                             |
| ---------- | -------------------------------------------------- |
| pre-commit | Runs lint-staged (type-checking + related tests)   |
| commit-msg | Validates commit message via commitlint            |
| pre-push   | Runs full `turbo build` + `turbo test` (192 tests) |

### CI/CD Pipeline (GitHub Actions)

Every push to `main` and every PR triggers the CI pipeline:

| Job          | Description                                            |
| ------------ | ------------------------------------------------------ |
| Typecheck    | TypeScript type checking across all packages           |
| Lint         | Code linting across all packages                       |
| Build & Test | Full build + 192 unit tests with coverage reporting    |
| Commitlint   | Validates PR commit messages (PRs only)                |
| E2E Tests    | 14 Playwright browser tests (lamp → genie → wish flow) |
| CI Gate      | Required status check — all jobs must pass             |

Tag pushes (`v*`) trigger the release pipeline: validation → Docker image builds → GitHub Release with auto-generated notes.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- How to report bugs and suggest features
- Development setup and workflow
- Code style and conventions
- Testing requirements

All contributions should maintain our high standards for code quality and test coverage.

## Security

For security vulnerabilities, please refer to our [SECURITY.md](SECURITY.md) policy. We take security seriously and appreciate responsible disclosure.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Support & Questions

- Open an issue for bug reports and feature requests
- Check existing [ADRs](docs/adr/) for architecture decisions
- See [docs/](docs/) for detailed documentation
- Visit the [runbook](docs/runbook.md) for operational guidance
