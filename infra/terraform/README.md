# Cursed Powers — Terraform Infrastructure

Enterprise-grade AWS infrastructure for a platform that generates useless superpowers.

## Architecture

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   (CDN + WAF)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │       ALB       │
                    │  (Path-based)   │
                    └───┬─────────┬───┘
                        │         │
               /api/*   │         │  /*
                   ┌────▼──┐  ┌──▼─────┐
                   │  ECS  │  │  ECS   │
                   │  API  │  │  Web   │
                   └───┬───┘  └────────┘
                       │
                  ┌────▼────┐
                  │   EFS   │
                  │ (SQLite)│
                  └─────────┘
```

## Directory Structure

```
infra/terraform/
├── backend/                    # Remote state bootstrap (S3 + DynamoDB)
│   └── main.tf
├── modules/
│   ├── networking/             # VPC, subnets, NAT, security groups
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/                # EFS for SQLite persistence
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ecs/                    # Cluster, ALB, task defs, services, IAM
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cdn/                    # CloudFront, WAF, ACM, Route53
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/             # CloudWatch alarms
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    └── prod/                   # Production root config
        ├── main.tf             # Module calls + backend config
        ├── variables.tf
        ├── outputs.tf
        └── terraform.tfvars.example
```

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.5.0
- A registered domain name (optional, for custom domain)

## Usage

### 1. Bootstrap Remote State

```bash
cd infra/terraform/backend
terraform init
terraform apply
```

This creates an S3 bucket and DynamoDB table for state locking.

### 2. Deploy Production

```bash
cd infra/terraform/environments/prod

# Copy and fill in your config
cp terraform.tfvars.example terraform.tfvars

# Set sensitive variables via environment
export TF_VAR_gemini_api_key="your-gemini-key"
export TF_VAR_openai_api_key="your-openai-key"

# Initialize (connects to S3 backend)
terraform init

# Plan
terraform plan

# Apply
terraform apply

# Destroy (when the cursed powers must end)
terraform destroy
```

## Modules

| Module         | Resources                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **networking** | VPC, public/private subnets, IGW, NAT Gateway, route tables, 4 security groups                           |
| **storage**    | EFS filesystem (encrypted, bursting), mount targets, access point, backup policy                         |
| **ecs**        | ECS cluster, IAM roles, SSM parameters, log groups, API + Web task definitions, ALB, listeners, services |
| **cdn**        | CloudFront distribution, WAF v2 (rate limit + managed rules), ACM certificate, Route53 zone + records    |
| **monitoring** | CloudWatch alarms: 5XX errors, p99 latency, CPU, memory, WAF blocked requests                            |

## Cost Estimate

| Resource              | Monthly Cost (est.) |
| --------------------- | ------------------- |
| ECS Fargate (2 tasks) | ~$30                |
| ALB                   | ~$20                |
| CloudFront            | ~$5                 |
| WAF                   | ~$10                |
| EFS                   | ~$1                 |
| CloudWatch            | ~$5                 |
| Route53               | ~$1                 |
| **Total**             | **~$72/month**      |

For a platform that generates useless superpowers.
