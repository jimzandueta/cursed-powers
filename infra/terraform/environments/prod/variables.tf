variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "cursed-powers"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "domain_name" {
  description = "Primary domain name (leave empty to skip Route53/ACM)"
  type        = string
  default     = ""
}

variable "enable_waf" {
  description = "Enable WAF on CloudFront"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit (requests per 5 min per IP)"
  type        = number
  default     = 2000
}

variable "api_image" {
  description = "Docker image URI for the API service"
  type        = string
}

variable "web_image" {
  description = "Docker image URI for the web frontend"
  type        = string
}

variable "api_cpu" {
  description = "CPU units for API task (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "api_memory" {
  description = "Memory (MB) for API task"
  type        = number
  default     = 2048
}

variable "web_cpu" {
  description = "CPU units for web task"
  type        = number
  default     = 512
}

variable "web_memory" {
  description = "Memory (MB) for web task"
  type        = number
  default     = 1024
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 1
}

variable "web_desired_count" {
  description = "Desired number of web tasks"
  type        = number
  default     = 1
}

variable "api_port" {
  description = "Port the API listens on"
  type        = number
  default     = 3001
}

variable "web_port" {
  description = "Port the web frontend listens on"
  type        = number
  default     = 3000
}

variable "gemini_api_key" {
  description = "Google Gemini API key for curse generation"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key for fallback curse generation"
  type        = string
  sensitive   = true
}
