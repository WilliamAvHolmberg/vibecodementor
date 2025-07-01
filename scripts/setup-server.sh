#!/bin/bash

# VibeCodeMentor Complete Server Setup Script
# Usage: ./scripts/setup-server.sh
# Interactive setup for DigitalOcean + Cloudflare Tunnel

set -e  # Exit on any error

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 VibeCodeMentor Server Setup${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Interactive prompts
echo -e "${YELLOW}📝 Please provide the following information:${NC}"
echo ""

read -p "🌐 Enter your DigitalOcean server IP: " SERVER_IP
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ Server IP is required!${NC}"
    exit 1
fi

read -p "🌍 Enter your domain name (e.g., vibecodementor.se): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}❌ Domain name is required!${NC}"
    exit 1
fi

read -p "🔗 Do you want to setup Cloudflare Tunnel? (y/n): " SETUP_TUNNEL
if [ "$SETUP_TUNNEL" != "y" ] && [ "$SETUP_TUNNEL" != "Y" ]; then
    echo -e "${YELLOW}⚠️  Skipping Cloudflare Tunnel setup. You'll need to configure DNS manually.${NC}"
    SETUP_TUNNEL="n"
else
    SETUP_TUNNEL="y"
fi

if [ "$SETUP_TUNNEL" = "y" ]; then
    echo ""
    echo -e "${BLUE}📋 Cloudflare Tunnel Setup Instructions:${NC}"
    echo -e "${BLUE}1. Go to Cloudflare Dashboard → Zero Trust → Access → Tunnels${NC}"
    echo -e "${BLUE}2. Create a new tunnel and copy the tunnel token${NC}"
    echo -e "${BLUE}3. Paste the token below${NC}"
    echo ""
    read -p "🔑 Enter your Cloudflare Tunnel Token: " TUNNEL_TOKEN
    if [ -z "$TUNNEL_TOKEN" ]; then
        echo -e "${RED}❌ Tunnel token is required for tunnel setup!${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Configuration received!${NC}"
echo -e "${GREEN}   Server IP: $SERVER_IP${NC}"
echo -e "${GREEN}   Domain: $DOMAIN_NAME${NC}"
echo -e "${GREEN}   Tunnel: $SETUP_TUNNEL${NC}"
echo ""

read -p "🚀 Continue with server setup? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}⚠️  Setup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${PURPLE}🔧 Starting server setup...${NC}"

# Test SSH connection first
echo -e "${BLUE}🔌 Testing SSH connection to $SERVER_IP...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to $SERVER_IP via SSH!${NC}"
    echo -e "${YELLOW}💡 Make sure:${NC}"
    echo -e "${YELLOW}   1. Server is running and accessible${NC}"
    echo -e "${YELLOW}   2. SSH key is added to the server${NC}"
    echo -e "${YELLOW}   3. Root SSH access is enabled${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful!${NC}"

# Create a temporary script on the server
ssh root@$SERVER_IP << EOF
    echo "📦 Updating system packages..."
    apt update && apt upgrade -y
    
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    echo "📁 Creating application directory..."
    mkdir -p /opt/vibecodementor
    chown -R root:root /opt/vibecodementor
    
    echo "📦 Installing pigz for faster deployment..."
    apt update && apt install -y pigz
    
    echo "🔄 Enabling Docker auto-start..."
    systemctl enable docker
    systemctl start docker
    
    echo "✅ Basic server setup complete!"
EOF

if [ "$SETUP_TUNNEL" = "y" ]; then
    echo ""
    echo -e "${BLUE}🌐 Setting up Cloudflare Tunnel...${NC}"
    
    ssh root@$SERVER_IP << EOF
        echo "📥 Installing Cloudflared..."
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        dpkg -i cloudflared.deb
        rm cloudflared.deb
        
        echo "🔑 Configuring tunnel with provided token..."
        cloudflared service install $TUNNEL_TOKEN
        
        echo "🔒 Setting up secure firewall (tunnel mode)..."
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw --force enable
        
        echo "🚀 Starting tunnel service..."
        systemctl start cloudflared
        systemctl enable cloudflared
        
        echo "📊 Checking tunnel status..."
        sleep 5
        systemctl status cloudflared --no-pager
        
        echo "✅ Cloudflare Tunnel setup complete!"
EOF
else
    echo ""
    echo -e "${YELLOW}🔒 Setting up standard firewall...${NC}"
    
    ssh root@$SERVER_IP << EOF
        echo "🔒 Setting up firewall..."
        ufw allow ssh
        ufw allow 80
        ufw allow 443
        ufw --force enable
        
        echo "✅ Standard firewall setup complete!"
EOF
fi

echo ""
echo -e "${GREEN}🎉 Server setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 Next Steps:${NC}"
echo -e "${CYAN}===============${NC}"

if [ "$SETUP_TUNNEL" = "y" ]; then
    echo -e "${GREEN}✅ Your server is ready with Cloudflare Tunnel!${NC}"
    echo -e "${BLUE}🌐 Domain: https://$DOMAIN_NAME${NC}"
    echo -e "${BLUE}🔒 IP Address: Hidden (tunnel protected)${NC}"
    echo -e "${BLUE}🛡️  Firewall: Secure (only SSH exposed)${NC}"
    echo ""
    echo -e "${YELLOW}🔧 To deploy your application:${NC}"
    echo -e "${YELLOW}   1. npm run setup:prod${NC}"
    echo -e "${YELLOW}   2. Edit .env with your production secrets${NC}"
    echo -e "${YELLOW}   3. npm run build${NC}"
    echo -e "${YELLOW}   4. npm run deploy (will prompt for server IP)${NC}"
else
    echo -e "${GREEN}✅ Your server is ready!${NC}"
    echo -e "${BLUE}🌐 Server IP: $SERVER_IP${NC}"
    echo -e "${BLUE}🔒 Firewall: HTTP/HTTPS enabled${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Manual DNS Setup Required:${NC}"
    echo -e "${YELLOW}   1. Point $DOMAIN_NAME A record to $SERVER_IP${NC}"
    echo -e "${YELLOW}   2. Enable Cloudflare proxy (orange cloud)${NC}"
    echo -e "${YELLOW}   3. npm run setup:prod${NC}"
    echo -e "${YELLOW}   4. Edit .env with your production secrets${NC}"
    echo -e "${YELLOW}   5. npm run build${NC}"
    echo -e "${YELLOW}   6. npm run deploy (will prompt for server IP)${NC}"
fi

# Save server IP for deploy script
echo "$SERVER_IP" > .server-ip
echo ""
echo -e "${PURPLE}💾 Server IP saved to .server-ip for deploy script${NC}"
echo -e "${PURPLE}🚀 Ready to deploy VibeCodeMentor!${NC}" 