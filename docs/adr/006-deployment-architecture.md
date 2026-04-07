# ADR-006: AWS ECS Fargate Deployment Architecture

**Status:** Accepted  
**Date:** 2026-04-04  
**Deciders:** Infrastructure Engineering, Security Architecture  
**Technical Story:** CURSED-78

## Context

The Cursed Powers platform requires a deployment architecture that supports:

1. Container-based deployment (Docker images for API and frontend)
2. Automatic scaling (to handle viral wish-making traffic)
3. TLS termination and CDN for frontend assets
4. Persistent storage for SQLite database file
5. Cost efficiency (this is, after all, a platform for generating useless superpowers)

The team evaluated:

| Option          | Pros                                     | Cons                             |
| --------------- | ---------------------------------------- | -------------------------------- |
| AWS ECS Fargate | Serverless containers, no EC2 management | Higher per-vCPU cost             |
| AWS EKS         | Full Kubernetes, industry standard       | Massive operational overhead     |
| AWS Lambda      | Pay-per-invocation                       | Cold starts, SQLite incompatible |
| Single EC2      | Simplest, cheapest                       | No auto-recovery, manual ops     |

## Decision

We will deploy on **AWS ECS Fargate** with the following architecture:

```
Internet → CloudFront (CDN + WAF)
              ↓
         ALB (Application Load Balancer)
           ↓              ↓
    [ECS: web]      [ECS: api]
                        ↓
                    EFS Volume (SQLite)
```

### Components

- **VPC**: 2 public + 2 private subnets across 2 AZs
- **CloudFront**: CDN distribution with WAF integration
- **ALB**: Path-based routing (`/api/*` → API service, `/*` → Web service)
- **ECS Fargate**: Serverless container orchestration (1 vCPU, 2GB RAM per task)
- **EFS**: Elastic File System for SQLite persistence across container restarts
- **CloudWatch**: Centralized logging, metrics, and alarms
- **ACM**: Managed TLS certificates
- **Route53**: DNS management

### Security Layers

1. **WAF**: Rate limiting, SQL injection blocking, geo-restriction capability
2. **Security Groups**: Least-privilege network access
3. **IAM**: Task roles with minimal permissions
4. **VPC**: Private subnets for ECS tasks (no public IP)

## Rationale

- **Zero server management**: Fargate eliminates EC2 instance lifecycle management
- **Automatic recovery**: Failed containers are automatically replaced
- **Cost control**: Pay-per-second billing with no idle EC2 costs
- **EFS for SQLite**: Provides persistent, durable storage without migrating to RDS (see ADR-002)
- **CloudFront + WAF**: Edge caching reduces origin load; WAF provides L7 protection

## Consequences

### Positive

- Production-grade infrastructure managed entirely via Terraform
- Auto-scaling handles traffic spikes
- Multi-AZ deployment for high availability
- Infrastructure-as-code enables reproducible environments

### Negative

- Fargate pricing is higher than EC2 for sustained workloads
- EFS adds latency to SQLite operations (~1-5ms vs local disk)
- CloudFront + WAF + ALB adds monthly baseline cost (~$50-100/month)
- Significant infrastructure complexity for a joke application

### Risks

- EFS performance under write-heavy SQLite workload (mitigated: WAL mode, throughput mode configuration)
- Cost overrun during viral traffic (mitigated: CloudFront caching, WAF rate limits, ECS max task count)
