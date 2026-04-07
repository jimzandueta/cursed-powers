variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix for CloudWatch dimensions"
  type        = string
}

variable "api_target_group_arn_suffix" {
  description = "API target group ARN suffix for CloudWatch dimensions"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name for CloudWatch dimensions"
  type        = string
}

variable "api_service_name" {
  description = "ECS API service name for CloudWatch dimensions"
  type        = string
}

variable "enable_waf" {
  description = "Whether WAF is enabled"
  type        = bool
  default     = true
}

variable "waf_web_acl_name" {
  description = "WAF web ACL name for CloudWatch dimensions"
  type        = string
  default     = ""
}
