output "api_5xx_alarm_arn" {
  description = "ARN of API 5XX alarm"
  value       = aws_cloudwatch_metric_alarm.api_5xx.arn
}

output "api_latency_alarm_arn" {
  description = "ARN of API latency alarm"
  value       = aws_cloudwatch_metric_alarm.api_latency.arn
}
