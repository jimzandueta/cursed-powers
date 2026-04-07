output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.ecs.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cdn.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cdn.cloudfront_distribution_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "api_service_name" {
  description = "ECS API service name"
  value       = module.ecs.api_service_name
}

output "web_service_name" {
  description = "ECS web service name"
  value       = module.ecs.web_service_name
}

output "efs_file_system_id" {
  description = "EFS file system ID"
  value       = module.storage.efs_file_system_id
}
