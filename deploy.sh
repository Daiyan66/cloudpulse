#!/bin/bash
# deploy.sh — Deploy CloudPulse to an AWS EC2 / Ubuntu VPS
# Run this ONCE on a fresh Ubuntu 22.04 server
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "=== CloudPulse Deployment Script ==="

# ─── 1. System update ─────────────────────────────────────────────────────────
sudo apt-get update -y && sudo apt-get upgrade -y

# ─── 2. Install Docker ────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker installed. Please log out and back in, then re-run this script."
  exit 0
fi

# ─── 3. Install Docker Compose plugin ────────────────────────────────────────
if ! command -v docker compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo apt-get install -y docker-compose-plugin
fi

# ─── 4. Install Certbot (SSL) ─────────────────────────────────────────────────
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  sudo apt-get install -y certbot python3-certbot-nginx
fi

# ─── 5. Clone repository ─────────────────────────────────────────────────────
REPO_URL=${REPO_URL:-"https://github.com/YOUR_USERNAME/cloudpulse.git"}
APP_DIR="/opt/cloudpulse"

if [ ! -d "$APP_DIR" ]; then
  sudo git clone "$REPO_URL" "$APP_DIR"
  sudo chown -R $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# ─── 6. Setup env files ───────────────────────────────────────────────────────
if [ ! -f "backend/.env.production" ]; then
  echo "⚠️  Create backend/.env.production before continuing!"
  echo "   Copy from backend/.env.example and fill in production values."
  exit 1
fi

# ─── 7. Obtain SSL certificate ───────────────────────────────────────────────
DOMAIN=${DOMAIN:-"your-domain.com"}
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo "Obtaining SSL certificate for $DOMAIN..."
  sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"
  # Copy certs to nginx/certs directory
  sudo mkdir -p nginx/certs
  sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/certs/
  sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/certs/
fi

# ─── 8. Pull images and start services ───────────────────────────────────────
echo "Starting CloudPulse stack..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# ─── 9. Auto-renew SSL via cron ──────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem /opt/cloudpulse/nginx/certs/ && docker compose -f /opt/cloudpulse/docker-compose.yml exec nginx nginx -s reload") | crontab -

echo ""
echo "✅ CloudPulse deployed!"
echo "   App:       https://$DOMAIN"
echo "   Prometheus: http://$DOMAIN:9090"
echo "   Grafana:    http://$DOMAIN:3001 (admin / see GRAFANA_ADMIN_PASSWORD)"
echo ""
echo "View logs: docker compose logs -f backend"
