output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn_suffix" {
  description = "ALB ARN suffix for CloudWatch"
  value       = aws_lb.main.arn_suffix
}

output "api_target_group_arn_suffix" {
  description = "API target group ARN suffix for CloudWatch"
  value       = aws_lb_target_group.api.arn_suffix
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "api_service_name" {
  description = "ECS API service name"
  value       = aws_ecs_service.api.name
}

output "web_service_name" {
  description = "ECS web service name"
  value       = aws_ecs_service.web.name
}

output "api_log_group_name" {
  description = "CloudWatch log group for API"
  value       = aws_cloudwatch_log_group.api.name
}

output "web_log_group_name" {
  description = "CloudWatch log group for web"
  value       = aws_cloudwatch_log_group.web.name
}

output "https_listener_arn" {
  description = "HTTPS listener ARN (for reference)"
  value       = aws_lb_listener.https.arn
}
