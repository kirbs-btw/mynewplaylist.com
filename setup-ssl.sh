#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
set -e

echo "🔒 Setting up SSL certificates with Let's Encrypt..."

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your domain name"
    echo "Usage: ./setup-ssl.sh your-domain.com"
    exit 1
fi

DOMAIN=$1

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        echo "❌ Error: Could not install certbot. Please install it manually."
        exit 1
    fi
fi

# Create ssl directory
mkdir -p ssl

# Stop nginx temporarily to free port 80
echo "🛑 Temporarily stopping nginx..."
docker compose -f docker-compose.prod.yml stop nginx

# Generate certificates
echo "🔐 Generating SSL certificates for $DOMAIN..."
sudo certbot certonly --standalone \
    --email admin@$DOMAIN \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates to ssl directory
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem

# Set proper permissions
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
chmod 600 ssl/cert.pem ssl/key.pem

# Start nginx with SSL
echo "🚀 Starting nginx with SSL..."
docker compose -f docker-compose.prod.yml up -d nginx

echo "✅ SSL setup completed!"
echo "🔒 Your site is now available at: https://$DOMAIN"
echo ""
echo "📅 Certificates will auto-renew. To manually renew:"
echo "   sudo certbot renew"
echo "   sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem"
echo "   sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem"
echo "   docker-compose -f docker-compose.prod.yml restart nginx" 