#!/bin/bash

# Production Deployment Script for mynewplaylist.com
set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.production.template to .env and configure your settings."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs/nginx
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "⚠️  Warning: SSL certificates not found in ssl/ directory"
    echo "You can either:"
    echo "1. Place your SSL certificates in ssl/cert.pem and ssl/key.pem"
    echo "2. Use Let's Encrypt to generate certificates"
    echo "3. Deploy without SSL (not recommended for production)"
    read -p "Continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Build and start production containers
echo "🔨 Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Show logs if there are issues
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   - HTTP:  http://$(hostname -I | awk '{print $1}')"
echo "   - HTTPS: https://$(hostname -I | awk '{print $1}') (if SSL configured)"
echo ""
echo "📊 To monitor your application:"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Check status: docker-compose -f docker-compose.prod.yml ps"
echo "   - Stop services: docker-compose -f docker-compose.prod.yml down" 