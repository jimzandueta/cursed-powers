output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "waf_web_acl_name" {
  description = "WAF web ACL name (empty if disabled)"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].name : ""
}
