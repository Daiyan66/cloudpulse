variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Name of existing EC2 Key Pair for SSH access"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Custom domain name (e.g. cloudpulse.example.com)"
  type        = string
  default     = "your-domain.com"
}

variable "repo_url" {
  description = "Git repository URL to clone and run on the host"
  type        = string
  default     = "https://github.com/YOUR_USERNAME/cloudpulse.git"
}
