# Operations Runbook

**Service:** Cursed Powers Platform  
**Last Updated:** 2026-04-07  
**On-Call:** See escalation policy in incident-response.md

## Table of Contents

1. [Common Operations](#1-common-operations)
2. [Deployment](#2-deployment)
3. [Database Operations](#3-database-operations)
4. [Troubleshooting](#4-troubleshooting)
5. [Emergency Procedures](#5-emergency-procedures)

---

## 1. Common Operations

### 1.1 Check Service Health

```bash
# Local
curl http://localhost:3001/api/v1/health | jq

# Production
curl https://your-domain.com/api/v1/health | jq

# Expected response includes:
# - status: "ok" or "degraded"
# - database.status: "healthy" or "unhealthy"
# - circuitBreakers.gemini.state: "CLOSED"
# - circuitBreakers.openai.state: "CLOSED"
# - process.memory (RSS, heap)
# - uptime
```

### 1.2 Check Teapot Compliance

```bash
curl -i https://your-domain.com/api/v1/teapot
# Expected: HTTP/1.1 418 I'm a Teapot
```

### 1.3 View Application Logs

```bash
# API logs
aws logs tail /ecs/cursed-powers/prod/api --follow

# Web logs
aws logs tail /ecs/cursed-powers/prod/web --follow

# Filter for errors only
aws logs filter-log-events \
  --log-group-name /ecs/cursed-powers/prod/api \
  --filter-pattern "ERROR"
```

### 1.4 Check ECS Service Status

```bash
aws ecs describe-services \
  --cluster cursed-powers-prod \
  --services cursed-powers-prod-api cursed-powers-prod-web \
  --query 'services[].{name:serviceName,desired:desiredCount,running:runningCount,status:status}' \
  --output table
```

---

## 2. Deployment

### 2.1 Standard Deployment

```bash
# 1. Build and push Docker images
docker build -t cursed-powers-api -f apps/api/Dockerfile .
docker build -t cursed-powers-web -f apps/web/Dockerfile .

# 2. Tag and push to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker tag cursed-powers-api:latest ghcr.io/jimzandueta/cursed-powers-api:latest
docker tag cursed-powers-web:latest ghcr.io/jimzandueta/cursed-powers-web:latest
docker push ghcr.io/jimzandueta/cursed-powers-api:latest
docker push ghcr.io/jimzandueta/cursed-powers-web:latest

# 3. Force new deployment
aws ecs update-service --cluster cursed-powers-prod --service cursed-powers-prod-api --force-new-deployment
aws ecs update-service --cluster cursed-powers-prod --service cursed-powers-prod-web --force-new-deployment

# 4. Wait for stable
aws ecs wait services-stable --cluster cursed-powers-prod --services cursed-powers-prod-api cursed-powers-prod-web
```

### 2.2 Infrastructure Changes

```bash
cd infra/terraform

# Always plan first
terraform plan -var-file=terraform.tfvars -out=plan.tfplan

# Review the plan carefully, then apply
terraform apply plan.tfplan
```

### 2.3 Rollback

```bash
# ECS automatically rolls back failed deployments (deployment circuit breaker enabled)
# For manual rollback, deploy a previous image tag:
aws ecs update-service \
  --cluster cursed-powers-prod \
  --service cursed-powers-prod-api \
  --task-definition cursed-powers-prod-api:<previous-revision>
```

---

## 3. Database Operations

### 3.1 Database Location

- **Local dev**: `apps/api/data/wishes.db`
- **Production**: EFS mount at `/app/data/wishes.db` inside container

### 3.2 Backup Database

```bash
# Local
cp apps/api/data/wishes.db apps/api/data/wishes-backup-$(date +%Y%m%d).db

# Production (exec into container)
aws ecs execute-command \
  --cluster cursed-powers-prod \
  --task <task-id> \
  --container api \
  --interactive \
  --command "/bin/sh -c 'cp /app/data/wishes.db /app/data/wishes-backup-$(date +%Y%m%d).db'"
```

### 3.3 Query Database

```bash
# Local
sqlite3 apps/api/data/wishes.db

# Useful queries
sqlite3 apps/api/data/wishes.db "SELECT COUNT(*) FROM wishes;"
sqlite3 apps/api/data/wishes.db "SELECT COUNT(*) FROM wishes WHERE created_at > datetime('now', '-1 day');"
sqlite3 apps/api/data/wishes.db "SELECT category, COUNT(*) as count FROM wishes GROUP BY category ORDER BY count DESC;"
```

---

## 4. Troubleshooting

### 4.1 Health Check Failing

**Symptoms**: ALB returns 503, ECS task marked unhealthy

**Steps**:

1. Check health endpoint response: `curl /api/v1/health`
2. If database unhealthy: check EFS mount, disk space
3. Check application logs for startup errors
4. Verify environment variables are set correctly

### 4.2 Circuit Breaker OPEN

**Symptoms**: Health endpoint shows circuit breaker in OPEN state

**Steps**:

1. Check which provider is affected (gemini or openai)
2. Verify provider status page
3. Circuit will auto-recover after 30s cooldown (transitions to HALF_OPEN)
4. If stuck: restart the ECS task to reset circuit state

### 4.3 High Memory Usage

**Symptoms**: CloudWatch alarm fires, OOM kills in logs

**Steps**:

1. Check health endpoint `process.memory` values
2. Check for memory leaks in recent deployments
3. Immediate: force new deployment (restarts containers)
4. Long-term: profile with `--inspect` flag in dev

### 4.4 Rate Limiting Too Aggressive

**Steps**:

1. Check current limits: `RATE_LIMIT_MAX` env var (default: 50), `RATE_LIMIT_WINDOW_MS` (default: 14,400,000ms / 4 hours)
2. Update via ECS task definition environment variables
3. WAF rate limit is separate: adjust `waf_rate_limit` in Terraform

### 4.5 Wish Generation Failing

**Steps**:

1. Check circuit breaker states in health endpoint
2. Check AI provider API key validity
3. Check rate limits on AI provider dashboard
4. Try the teapot endpoint to confirm API is responsive
5. Check moderation logs for regex-based content blocks

---

## 5. Emergency Procedures

### 5.1 Full Outage Recovery

```bash
# 1. Check infrastructure
terraform plan -var-file=terraform.tfvars

# 2. Restart services
aws ecs update-service --cluster cursed-powers-prod --service cursed-powers-prod-api --force-new-deployment
aws ecs update-service --cluster cursed-powers-prod --service cursed-powers-prod-web --force-new-deployment

# 3. Verify recovery
curl https://your-domain.com/api/v1/health
```

### 5.2 Database Recovery

```bash
# EFS backups are automatic (see efs.tf backup_policy)
# To restore from AWS Backup:
# 1. Go to AWS Backup console
# 2. Find latest recovery point for the EFS filesystem
# 3. Restore to a new EFS filesystem
# 4. Update Terraform to point to new EFS ID
# 5. Redeploy
```

### 5.3 API Key Rotation

```bash
# 1. Generate new API key from provider dashboard
# 2. Update SSM parameter
aws ssm put-parameter \
  --name "/cursed-powers/prod/gemini-api-key" \
  --value "new-key-here" \
  --type SecureString \
  --overwrite

# 3. Force new deployment to pick up new key
aws ecs update-service --cluster cursed-powers-prod --service cursed-powers-prod-api --force-new-deployment
```

### 5.4 WAF Emergency Block

```bash
# Block a specific IP
aws wafv2 update-ip-set \
  --name "cursed-powers-blocklist" \
  --scope CLOUDFRONT \
  --region us-east-1 \
  --addresses "1.2.3.4/32" \
  --id <ip-set-id> \
  --lock-token <lock-token>
```
