terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC & Networking ────────────────────────────────────────────────────────
resource "aws_vpc" "cloudpulse_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "cloudpulse-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "cloudpulse_igw" {
  vpc_id = aws_vpc.cloudpulse_vpc.id

  tags = {
    Name = "cloudpulse-igw"
  }
}

resource "aws_subnet" "cloudpulse_public_subnet" {
  vpc_id                  = aws_vpc.cloudpulse_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "cloudpulse-public-subnet"
  }
}

resource "aws_route_table" "cloudpulse_public_rt" {
  vpc_id = aws_vpc.cloudpulse_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.cloudpulse_igw.id
  }

  tags = {
    Name = "cloudpulse-public-rt"
  }
}

resource "aws_route_table_association" "cloudpulse_public_assoc" {
  subnet_id      = aws_subnet.cloudpulse_public_subnet.id
  route_table_id = aws_route_table.cloudpulse_public_rt.id
}

# ─── Security Group ──────────────────────────────────────────────────────────
resource "aws_security_group" "cloudpulse_sg" {
  name        = "cloudpulse-web-sg"
  description = "Allow inbound HTTP, HTTPS, SSH, and monitoring access"
  vpc_id      = aws_vpc.cloudpulse_vpc.id

  # SSH
  ingress {
    description = "SSH from anywhere (restricted in production)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP Web Traffic
  ingress {
    description = "HTTP reverse proxy"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Web Traffic
  ingress {
    description = "HTTPS reverse proxy"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana Dashboard (Restricted or Public Admin)
  ingress {
    description = "Grafana dashboard port"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound to all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cloudpulse-sg"
  }
}

# ─── Ubuntu 22.04 LTS AMI ────────────────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── EC2 Instance ────────────────────────────────────────────────────────────
resource "aws_instance" "cloudpulse_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.cloudpulse_public_subnet.id
  vpc_security_group_ids = [aws_security_group.cloudpulse_sg.id]
  key_name               = var.key_name

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/userdata.sh", {
    DOMAIN   = var.domain_name
    REPO_URL = var.repo_url
  })

  tags = {
    Name        = "cloudpulse-server"
    Environment = var.environment
  }
}
