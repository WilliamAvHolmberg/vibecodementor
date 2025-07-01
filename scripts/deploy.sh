#!/bin/bash

# VibeCodeMentor Simple Deploy Script
# Usage: ./scripts/deploy.sh [server-ip]
# Deploys Docker images directly via SSH using docker save/load

set -e  # Exit on any error

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="root"
REMOTE_DIR="/opt/vibecodementor"

echo -e "${BLUE}🚀 VibeCodeMentor Simple Deploy${NC}"
echo -e "${BLUE}==============================${NC}"

# Check if build version exists
if [ ! -f ".build-version" ]; then
    echo -e "${RED}❌ No build version found! Run 'npm run build' first${NC}"
    exit 1
fi

BUILD_VERSION=$(cat .build-version | tr -d '\n\r')
echo -e "${GREEN}📦 Deploying version: $BUILD_VERSION${NC}"

# Get server IP
if [ -n "$1" ]; then
    SERVER_IP="$1"
elif [ -f ".server-ip" ]; then
    SERVER_IP=$(cat .server-ip | tr -d '\n\r')
else
    read -p "🌐 Enter server IP: " SERVER_IP
fi

echo -e "${BLUE}🎯 Target: $REMOTE_USER@$SERVER_IP${NC}"

# Test SSH connection
echo -e "${BLUE}🔌 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $REMOTE_USER@$SERVER_IP exit 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to server!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection OK${NC}"

# Images to deploy
IMAGES=(
    "vibecodementor-api:$BUILD_VERSION"
    "vibecodementor-frontend:$BUILD_VERSION" 
    "vibecodementor-nginx:$BUILD_VERSION"
)

# Check if images exist locally
echo -e "${BLUE}🔍 Checking local images...${NC}"
for image in "${IMAGES[@]}"; do
    if ! docker image inspect "$image" >/dev/null 2>&1; then
        echo -e "${RED}❌ Image $image not found! Run 'npm run build' first${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✅ $image${NC}"
done

echo ""
read -p "🚀 Deploy to production? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}⚠️  Deploy cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}📤 Transferring images via SSH...${NC}"

# Transfer all images in one batch (faster due to layer deduplication)
echo -e "${BLUE}  🏗️  Saving and transferring all images...${NC}"
if command -v pigz >/dev/null 2>&1; then
    # Use pigz for multi-threaded compression (much faster)
    docker save "${IMAGES[@]}" | pigz --fast | ssh $REMOTE_USER@$SERVER_IP "pigz -d | docker load"
else
    # Fallback to gzip
    docker save "${IMAGES[@]}" | gzip | ssh $REMOTE_USER@$SERVER_IP "gunzip | docker load"
fi

# Tag images as latest for docker-compose
echo -e "${BLUE}🏷️  Updating image tags...${NC}"
ssh $REMOTE_USER@$SERVER_IP << EOF
    docker tag vibecodementor-api:$BUILD_VERSION vibecodementor-api:latest
    docker tag vibecodementor-frontend:$BUILD_VERSION vibecodementor-frontend:latest
    docker tag vibecodementor-nginx:$BUILD_VERSION vibecodementor-nginx:latest
EOF

# Copy deployment files
echo -e "${BLUE}📋 Copying configuration...${NC}"
ssh $REMOTE_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
scp infrastructure/docker-compose.prod.yml $REMOTE_USER@$SERVER_IP:$REMOTE_DIR/docker-compose.yml

# Copy environment file if it exists
if [ -f ".env" ]; then
    echo -e "${BLUE}🔧 Copying environment...${NC}"
    scp .env $REMOTE_USER@$SERVER_IP:$REMOTE_DIR/.env
fi

# Deploy using modern docker compose command
echo -e "${BLUE}🚀 Starting deployment...${NC}"
ssh $REMOTE_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # Stop existing services
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Start new services
    docker compose up -d
    
    # Save deployment info
    echo "$BUILD_VERSION" > .current-version
    echo "$(date)" > .last-deploy-time
    
    echo "✅ Services started!"
    echo ""
    echo "📊 Service Status:"
    docker compose ps
EOF

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}✅ Version: $BUILD_VERSION${NC}"
echo -e "${GREEN}✅ Server: $SERVER_IP${NC}"

# Simple health check
echo -e "${BLUE}🏥 Basic health check...${NC}"
sleep 10

if ssh $REMOTE_USER@$SERVER_IP "docker compose -f $REMOTE_DIR/docker-compose.yml ps | grep -c 'running'" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Services are running!${NC}"
    
    # Save successful deployment
    echo "$BUILD_VERSION" > .last-successful-deployment
    echo -e "${BLUE}💾 Deployment recorded${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may not be ready yet${NC}"
    echo -e "${BLUE}💡 Check logs: ssh $REMOTE_USER@$SERVER_IP 'cd $REMOTE_DIR && docker compose logs'${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Application should be live soon!${NC}" 