#!/bin/bash

# VibeCodeMentor Complete Build Script
# Usage: ./scripts/build.sh
# Builds all Docker images with timestamp versioning

set -e  # Exit on any error

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Generate timestamp version
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${CYAN}🔨 VibeCodeMentor Build System${NC}"
echo -e "${CYAN}================================${NC}"
echo -e "${GREEN}📦 Building version: $TIMESTAMP${NC}"
echo ""

# Build API Docker image
echo -e "${BLUE}🔧 Building API (.NET 9) for linux/amd64...${NC}"
docker build --platform linux/amd64 -f ./api/api.Dockerfile \
  -t vibecodementor-api:$TIMESTAMP \
  -t vibecodementor-api:latest \
  . --progress=plain

echo -e "${GREEN}✅ API image built successfully${NC}"
echo ""

# Build Frontend Docker image  
echo -e "${BLUE}🎨 Building Frontend (Next.js) for linux/amd64...${NC}"

# Read environment variables from .env file for build args
if [ -f ".env" ]; then
    NEXT_PUBLIC_GA_ID=$(grep "^NEXT_PUBLIC_GA_ID=" .env | cut -d '=' -f2-)
    BUILD_ARGS="--build-arg NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}"
else
    BUILD_ARGS=""
fi

docker build --platform linux/amd64 -f ./frontend/frontend.Dockerfile \
  $BUILD_ARGS \
  -t vibecodementor-frontend:$TIMESTAMP \
  -t vibecodementor-frontend:latest \
  . --progress=plain

echo -e "${GREEN}✅ Frontend image built successfully${NC}"
echo ""

# Build Nginx Docker image
echo -e "${BLUE}🌐 Building Nginx (Reverse Proxy) for linux/amd64...${NC}"
docker build --platform linux/amd64 -f infrastructure/docker/nginx.Dockerfile \
  -t vibecodementor-nginx:$TIMESTAMP \
  -t vibecodementor-nginx:latest \
  . --progress=plain

echo -e "${GREEN}✅ Nginx image built successfully${NC}"
echo ""

# Display build results
echo -e "${PURPLE}📊 Build Summary:${NC}"
echo -e "${PURPLE}=================${NC}"
echo -e "${GREEN}✅ API:       vibecodementor-api:$TIMESTAMP${NC}"
echo -e "${GREEN}✅ Frontend:  vibecodementor-frontend:$TIMESTAMP${NC}"
echo -e "${GREEN}✅ Nginx:     vibecodementor-nginx:$TIMESTAMP${NC}"
echo ""

# Show image sizes
echo -e "${YELLOW}📏 Image Sizes:${NC}"
docker images | grep vibecodementor | grep $TIMESTAMP

echo ""
echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo -e "${BLUE}🚀 Next step: npm run deploy${NC}"

# Save build version for deploy script
echo "$TIMESTAMP" > .build-version
echo -e "${PURPLE}💾 Build version saved to .build-version${NC}" 