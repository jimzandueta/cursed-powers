resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-api-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API 5XX errors exceeded threshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    TargetGroup  = var.api_target_group_arn_suffix
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name     = "${var.project_name}-api-5xx-alarm"
    Severity = "critical"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-${var.environment}-api-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  extended_statistic  = "p99"
  threshold           = 5
  alarm_description   = "API p99 latency > 5s"
  treat_missing_data  = "notBreaching"

  dimensions = {
    TargetGroup  = var.api_target_group_arn_suffix
    LoadBalancer = var.alb_arn_suffix
  }

  tags = {
    Name     = "${var.project_name}-api-latency-alarm"
    Severity = "warning"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-api-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "API CPU > 80%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.api_service_name
  }

  tags = {
    Name     = "${var.project_name}-api-cpu-alarm"
    Severity = "warning"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_memory" {
  alarm_name          = "${var.project_name}-${var.environment}-api-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "API memory > 85%"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.api_service_name
  }

  tags = {
    Name     = "${var.project_name}-api-memory-alarm"
    Severity = "warning"
  }
}

resource "aws_cloudwatch_metric_alarm" "waf_blocked" {
  count               = var.enable_waf ? 1 : 0
  alarm_name          = "${var.project_name}-${var.environment}-waf-blocked"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = 300
  statistic           = "Sum"
  threshold           = 100
  alarm_description   = "WAF blocked > 100 requests in 5 min"
  treat_missing_data  = "notBreaching"

  dimensions = {
    WebACL = var.waf_web_acl_name
    Rule   = "ALL"
    Region = "us-east-1"
  }

  tags = {
    Name     = "${var.project_name}-waf-blocked-alarm"
    Severity = "warning"
  }
}
