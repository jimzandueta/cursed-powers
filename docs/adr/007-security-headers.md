# ADR-007: Defense-in-Depth Security Headers

**Status:** Accepted  
**Date:** 2026-04-05  
**Deciders:** Security Architecture Review Board  
**Technical Story:** CURSED-85

## Context

The Cursed Powers platform serves user-generated content (wish text, AI-generated curse descriptions) in a web interface. This content surface, combined with the public-facing nature of the application, requires comprehensive browser-level security controls.

OWASP guidelines recommend implementing the following HTTP security headers to mitigate common web vulnerabilities:

- Cross-Site Scripting (XSS)
- Clickjacking
- MIME type sniffing
- Information disclosure
- Cross-origin attacks

## Decision

We will implement a **defense-in-depth security header strategy** across both the API (via `@fastify/helmet`) and frontend (via Next.js custom headers):

### API Headers (Helmet)

| Header                      | Value                                                                                                  | Mitigates                |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------ |
| Content-Security-Policy     | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:` | XSS, injection           |
| X-Content-Type-Options      | `nosniff`                                                                                              | MIME sniffing            |
| X-Frame-Options             | `SAMEORIGIN`                                                                                           | Clickjacking             |
| X-XSS-Protection            | `0` (disabled, CSP is superior)                                                                        | Legacy XSS filter issues |
| Strict-Transport-Security   | `max-age=15552000; includeSubDomains`                                                                  | Protocol downgrade       |
| Cross-Origin-Embedder-Policy| `require-corp`                                                                                         | Cross-origin isolation   |
| Cross-Origin-Opener-Policy  | `same-origin`                                                                                          | Cross-origin attacks     |
| Cross-Origin-Resource-Policy| `same-origin`                                                                                          | Cross-origin leaks       |

### Frontend Headers (Next.js)

| Header                    | Value                                                  | Mitigates          |
| ------------------------- | ------------------------------------------------------ | ------------------ |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload`         | Protocol downgrade |
| X-Frame-Options           | `SAMEORIGIN`                                           | Clickjacking       |
| X-Content-Type-Options    | `nosniff`                                              | MIME sniffing      |
| Referrer-Policy           | `strict-origin-when-cross-origin`                      | Referrer leakage   |
| Permissions-Policy        | `camera=(), microphone=(), geolocation=(), payment=()` | Feature abuse      |
| X-DNS-Prefetch-Control    | `on`                                                   | Performance        |

### Custom Headers

| Header          | Value                                    | Purpose                |
| --------------- | ---------------------------------------- | ---------------------- |
| X-Powered-By    | `Cursed Genie v0.1.0 (HTCPCP-Compliant)` | RFC 2324 compliance    |
| X-Response-Time | `{duration}ms`                           | Observability          |
| X-Content-Hash  | SHA-256 hex digest of response body      | Response integrity     |

## Rationale

- **Industry standard**: These headers are recommended by OWASP, Mozilla Observatory, and security scanning tools
- **Zero cost**: Headers add negligible response size overhead
- **Browser enforcement**: Security controls are enforced client-side without application logic changes
- **Compliance**: Enables favorable scores on automated security scanners (important for enterprise customers seeking cursed superpowers)

## Consequences

### Positive

- A+ rating on Mozilla Observatory and SecurityHeaders.com
- Browser-enforced protection against common web vulnerabilities
- HTCPCP compliance clearly communicated via X-Powered-By header

### Negative

- `unsafe-inline` for `style-src` is required by inline styles (Tailwind CSS)
- Header configuration must be maintained across two services (API + frontend)
- Overly restrictive CSP may break third-party integrations in the future

### Risks

- CSP misconfiguration could break application functionality (mitigated: tested in development before production)
