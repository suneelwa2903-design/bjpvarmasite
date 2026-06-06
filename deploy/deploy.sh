#!/bin/bash
# VarmaSite Deployment Script
# Usage: bash deploy/deploy.sh

set -e

APP_DIR="/var/www/varmasite"

echo "=== Deploying VarmaSite ==="

cd "$APP_DIR"

# Pull latest code
echo "Pulling latest code..."
git pull origin master

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building application..."
npm run build

# Reload PM2
echo "Reloading PM2..."
pm2 reload varmasite --update-env

echo ""
echo "=== Deployment Complete ==="
echo "Check status: pm2 status"
echo "Check logs:   pm2 logs varmasite"
