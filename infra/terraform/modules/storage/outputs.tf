output "efs_file_system_id" {
  description = "EFS file system ID"
  value       = aws_efs_file_system.data.id
}

output "efs_file_system_arn" {
  description = "EFS file system ARN"
  value       = aws_efs_file_system.data.arn
}

output "efs_access_point_id" {
  description = "EFS access point ID"
  value       = aws_efs_access_point.data.id
}
