variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name (empty string to skip)"
  type        = string
  default     = ""
}

variable "alb_dns_name" {
  description = "ALB DNS name for CloudFront origin"
  type        = string
}

variable "enable_waf" {
  description = "Enable WAF on CloudFront distribution"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit (requests per 5 minutes per IP)"
  type        = number
  default     = 2000
}
