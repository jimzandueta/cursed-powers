# Security Policy

## Reporting a Vulnerability

The Cursed Powers security team takes all vulnerability reports seriously — even for a platform that generates useless superpowers.

### Reporting Process

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email security findings to: **security@cursed-powers.example.com**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation (if any)

### Response Timeline

| Stage                        | SLA      |
| ---------------------------- | -------- |
| Acknowledgment               | 24 hours |
| Triage & severity assessment | 48 hours |
| Resolution (Critical)        | 7 days   |
| Resolution (High)            | 14 days  |
| Resolution (Medium/Low)      | 30 days  |

### Scope

The following are **in scope** for security reports:

- Cross-Site Scripting (XSS) in wish display
- SQL Injection via wish input
- Server-Side Request Forgery (SSRF)
- Authentication/Authorization bypass
- Information disclosure (API keys, internal paths)
- Denial of Service (application-level)
- Prompt injection leading to harmful AI output

The following are **out of scope**:

- The fact that the superpowers are useless (this is by design)
- HTTP 418 responses (this is RFC 2324 compliance, not a vulnerability)
- Rate limiting (this is intentional protection, not a bug)
- Social engineering attacks against the genie

## Security Architecture

### Defense in Depth

```
Layer 1: CloudFront + WAF (L7 filtering, rate limiting, managed rules)
Layer 2: ALB (TLS termination, health checks)
Layer 3: Security Groups (network-level isolation)
Layer 4: Helmet (HTTP security headers — CSP, HSTS, X-Frame-Options)
Layer 5: Rate Limiting (@fastify/rate-limit — per-IP throttling)
Layer 6: Input Moderation (OpenAI Moderation API — content filtering)
Layer 7: Zod Schema Validation (type-safe input/output validation)
Layer 8: Circuit Breakers (fault isolation for AI providers)
```

### Data Classification

| Data Type | Classification | Encryption                          |
| --------- | -------------- | ----------------------------------- |
| Wish text | Public         | At rest (EFS), in transit (TLS 1.3) |
| IP hashes | Internal       | SHA-256, not reversible             |
| API keys  | Secret         | SSM SecureString, env vars          |
| Database  | Internal       | EFS encryption at rest              |

### Dependencies

Dependencies are monitored via:

- `npm audit` in CI/CD pipeline
- Dependabot alerts on GitHub
- Manual review of critical dependency updates

### Compliance

- **HTCPCP (RFC 2324)**: Fully compliant. See ADR-009.
- **OWASP Top 10**: Addressed via defense-in-depth architecture.
- **SOC 2**: Not applicable (but we have the ADRs for it).

## Supported Versions

| Version | Supported  |
| ------- | ---------- |
| 0.1.x   | ✅ Current |
| < 0.1   | ❌ No      |
