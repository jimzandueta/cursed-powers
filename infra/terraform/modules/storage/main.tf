resource "aws_efs_file_system" "data" {
  creation_token  = "${var.project_name}-${var.environment}-data"
  encrypted       = true
  throughput_mode  = "bursting"

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-efs"
  }
}

resource "aws_efs_mount_target" "data" {
  count           = length(var.private_subnet_ids)
  file_system_id  = aws_efs_file_system.data.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [var.efs_security_group_id]
}

resource "aws_efs_access_point" "data" {
  file_system_id = aws_efs_file_system.data.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/cursed-powers-data"

    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-efs-ap"
  }
}

resource "aws_efs_backup_policy" "data" {
  file_system_id = aws_efs_file_system.data.id

  backup_policy {
    status = "ENABLED"
  }
}
