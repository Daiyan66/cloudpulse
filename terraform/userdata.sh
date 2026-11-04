#!/bin/bash
set -e

# Update and install Docker prerequisites
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git

# Install Docker Engine
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Clone repository
APP_DIR="/opt/cloudpulse"
if [ ! -d "$APP_DIR" ]; then
  git clone "${REPO_URL}" "$APP_DIR" || echo "Git clone failed, manually place repo in /opt/cloudpulse"
fi

if [ -d "$APP_DIR" ]; then
  chown -R ubuntu:ubuntu "$APP_DIR"
  cd "$APP_DIR"
fi

echo "CloudPulse Terraform bootstrap complete."
