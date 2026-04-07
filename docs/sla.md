# Service Level Agreement (SLA)

**Effective Date:** 2026-04-05  
**Document Owner:** Platform Engineering  
**Service:** Cursed Powers — Wish Generation Platform

## 1. Service Description

The Cursed Powers platform provides:

- AI-powered wish corruption (monkey's paw style)
- Wish gallery browsing
- Random wish discovery
- HTCPCP-compliant teapot responses

## 2. Service Level Objectives (SLOs)

### 2.1 Availability

| Metric          | Target              | Measurement                              |
| --------------- | ------------------- | ---------------------------------------- |
| Platform uptime | 99.9% (three nines) | Monthly, excluding scheduled maintenance |
| Health endpoint | 99.99% (four nines) | 30-second intervals                      |

**Monthly downtime budget:**

- 99.9% = 43 minutes 49 seconds per month
- 99.99% = 4 minutes 23 seconds per month (health endpoint only)

### 2.2 Latency

| Endpoint                    | p50    | p95     | p99     |
| --------------------------- | ------ | ------- | ------- |
| `GET /api/v1/health`        | < 5ms  | < 20ms  | < 50ms  |
| `GET /api/v1/wishes`        | < 50ms | < 200ms | < 500ms |
| `POST /api/v1/wishes`       | < 3s   | < 8s    | < 15s   |
| `GET /api/v1/wishes/random` | < 30ms | < 100ms | < 300ms |
| `GET /api/v1/teapot`        | < 5ms  | < 10ms  | < 20ms  |

Note: Wish generation latency is dominated by AI provider response time, which is outside our control but within our circuit breaker's jurisdiction.

### 2.3 Error Rate

| Metric                                 | Target             |
| -------------------------------------- | ------------------ |
| 5XX error rate                         | < 0.1% of requests |
| 4XX error rate (excluding rate limits) | < 5% of requests   |
| Wish generation success rate           | > 95%              |
| Circuit breaker trip rate              | < 1 trip per day   |

### 2.4 Throughput

| Metric                           | Capacity              |
| -------------------------------- | --------------------- |
| Concurrent wish generations      | 10                    |
| Gallery requests per second      | 100                   |
| Health check requests per second | 1,000                 |
| Teapot requests per second       | ∞ (they're very fast) |

## 3. Maintenance Windows

- **Scheduled maintenance**: Sundays 02:00-04:00 UTC
- **Notification**: 72 hours in advance via GitHub status
- **Emergency maintenance**: As needed with best-effort notification

## 4. Support

| Channel                     | Response Time     |
| --------------------------- | ----------------- |
| GitHub Issues               | 48 hours          |
| Security Reports            | 24 hours          |
| HTCPCP Compliance Inquiries | Immediately (418) |

## 5. Exclusions

The following are explicitly excluded from this SLA:

- The usefulness of generated superpowers
- Emotional damage from reading your cursed power
- Existential dread induced by the "but" clause
- Any real-world attempt to use granted powers
- Tea brewing capability (per RFC 2324, we are a teapot)

## 6. SLA Credits

If monthly availability drops below 99.9%, affected users are entitled to:

| Uptime        | Credit                                              |
| ------------- | --------------------------------------------------- |
| 99.0% - 99.9% | 1 additional wish                                   |
| 95.0% - 99.0% | 3 additional wishes                                 |
| < 95.0%       | 5 additional wishes + formal apology from the genie |

Note: As the service is free, all credits are denominated in wishes, which are also free, making this SLA credit structure admirably self-referential.
