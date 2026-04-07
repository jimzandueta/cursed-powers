terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "cursed-powers-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cursed-powers-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Repository  = "cursed-powers"
    }
  }
}

module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  api_port     = var.api_port
  web_port     = var.web_port
}

module "storage" {
  source = "../../modules/storage"

  project_name          = var.project_name
  environment           = var.environment
  private_subnet_ids    = module.networking.private_subnet_ids
  efs_security_group_id = module.networking.efs_security_group_id
}

module "ecs" {
  source = "../../modules/ecs"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  vpc_id                    = module.networking.vpc_id
  public_subnet_ids         = module.networking.public_subnet_ids
  private_subnet_ids        = module.networking.private_subnet_ids
  alb_security_group_id     = module.networking.alb_security_group_id
  ecs_api_security_group_id = module.networking.ecs_api_security_group_id
  ecs_web_security_group_id = module.networking.ecs_web_security_group_id
  efs_file_system_id        = module.storage.efs_file_system_id
  efs_file_system_arn       = module.storage.efs_file_system_arn
  efs_access_point_id       = module.storage.efs_access_point_id
  certificate_arn           = module.cdn.certificate_arn
  api_image                 = var.api_image
  web_image                 = var.web_image
  api_cpu                   = var.api_cpu
  api_memory                = var.api_memory
  web_cpu                   = var.web_cpu
  web_memory                = var.web_memory
  api_desired_count         = var.api_desired_count
  web_desired_count         = var.web_desired_count
  api_port                  = var.api_port
  web_port                  = var.web_port
  gemini_api_key            = var.gemini_api_key
  openai_api_key            = var.openai_api_key
}

module "cdn" {
  source = "../../modules/cdn"

  project_name   = var.project_name
  environment    = var.environment
  domain_name    = var.domain_name
  alb_dns_name   = module.ecs.alb_dns_name
  enable_waf     = var.enable_waf
  waf_rate_limit = var.waf_rate_limit
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_name               = var.project_name
  environment                = var.environment
  alb_arn_suffix             = module.ecs.alb_arn_suffix
  api_target_group_arn_suffix = module.ecs.api_target_group_arn_suffix
  ecs_cluster_name           = module.ecs.cluster_name
  api_service_name           = module.ecs.api_service_name
  enable_waf                 = var.enable_waf
  waf_web_acl_name           = module.cdn.waf_web_acl_name
}
