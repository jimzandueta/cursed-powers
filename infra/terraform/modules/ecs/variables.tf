variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB"
  type        = string
}

variable "ecs_api_security_group_id" {
  description = "Security group ID for API ECS tasks"
  type        = string
}

variable "ecs_web_security_group_id" {
  description = "Security group ID for web ECS tasks"
  type        = string
}

variable "efs_file_system_id" {
  description = "EFS file system ID for SQLite persistence"
  type        = string
}

variable "efs_file_system_arn" {
  description = "EFS file system ARN for IAM policy"
  type        = string
}

variable "efs_access_point_id" {
  description = "EFS access point ID"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener"
  type        = string
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
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}
