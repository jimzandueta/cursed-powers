# Incident Response Plan

**Document Owner:** Site Reliability Engineering  
**Last Review:** 2026-04-06  
**Next Review:** 2026-07-06  
**Classification:** Internal

## 1. Overview

This document defines the incident response procedures for the Cursed Powers platform. An "incident" is defined as any event that causes or threatens to cause degraded wish generation capability, data loss, or security compromise.

## 2. Severity Levels

| Level     | Description            | Examples                                    | Response Time     |
| --------- | ---------------------- | ------------------------------------------- | ----------------- |
| **SEV-1** | Total platform outage  | Both AI providers down, database corruption | 15 min            |
| **SEV-2** | Major feature degraded | Primary AI provider down (failover active)  | 30 min            |
| **SEV-3** | Minor feature impacted | Elevated error rate, slow responses         | 2 hours           |
| **SEV-4** | Cosmetic / low impact  | UI glitch, non-critical log errors          | Next business day |

## 3. Incident Response Team

| Role                   | Responsibility                             |
| ---------------------- | ------------------------------------------ |
| **Incident Commander** | Coordinates response, communicates status  |
| **Technical Lead**     | Diagnoses root cause, implements fix       |
| **Communications**     | Updates status page, notifies stakeholders |

## 4. Response Procedure

### 4.1 Detection

Incidents are detected via:

- CloudWatch alarms (5XX rate, latency, CPU, memory)
- WAF alerts (blocked request spikes)
- Health endpoint monitoring (`/api/v1/health`)
- Circuit breaker state changes (logged in application)
- User reports (GitHub issues)

### 4.2 Triage

1. Assess severity using the table above
2. Assign Incident Commander
3. Create incident channel (if SEV-1/SEV-2)
4. Begin investigation

### 4.3 Investigation Checklist

```
□ Check health endpoint: GET /api/v1/health
  - Database status (healthy/unhealthy)
  - Circuit breaker states (CLOSED/OPEN/HALF_OPEN)
  - Memory usage

□ Check CloudWatch logs
  - API: /ecs/cursed-powers/prod/api
  - Web: /ecs/cursed-powers/prod/web

□ Check ECS service status
  - Task count vs desired count
  - Recent deployment events
  - Task health check failures

□ Check external dependencies
  - Gemini API: https://status.cloud.google.com
  - OpenAI API: https://status.openai.com

□ Check WAF metrics
  - Blocked request count
  - Top blocked IPs
```

### 4.4 Mitigation

| Scenario            | Mitigation                                        |
| ------------------- | ------------------------------------------------- |
| AI provider outage  | Circuit breaker auto-failover to secondary        |
| High error rate     | Scale up ECS tasks; check logs for root cause     |
| Database corruption | Restore from EFS backup                           |
| DDoS attack         | WAF rate limit adjustment; geo-blocking if needed |
| Memory leak         | Rolling restart via ECS force new deployment      |

### 4.5 Resolution

1. Confirm service restoration via health endpoint
2. Verify wish generation works end-to-end
3. Document root cause and timeline
4. Schedule post-incident review

## 5. Post-Incident Review

Within 48 hours of SEV-1/SEV-2 resolution:

1. Timeline of events
2. Root cause analysis (5 Whys)
3. What went well
4. What could be improved
5. Action items with owners and deadlines

## 6. Escalation Path

```
Engineer on-call
    ↓ (15 min no response)
Engineering Manager
    ↓ (30 min no response)
VP of Engineering
    ↓ (if data breach)
Legal & Compliance
```

Note: All of the above roles are currently the same person, which significantly streamlines the escalation process.
