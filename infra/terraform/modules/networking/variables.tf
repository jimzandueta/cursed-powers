variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "api_port" {
  description = "Port the API listens on"
  type        = number
}

variable "web_port" {
  description = "Port the web frontend listens on"
  type        = number
}
