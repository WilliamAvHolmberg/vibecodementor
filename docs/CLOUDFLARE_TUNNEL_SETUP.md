# 🌐 Cloudflare Tunnel Setup Guide

> Quick guide to get your tunnel token for the interactive setup script

## 🚀 Steps to Get Your Tunnel Token

### **1. Access Cloudflare Zero Trust Dashboard**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Select your domain
- Navigate to **Zero Trust** → **Networks** → **Tunnels**

### **2. Create a New Tunnel**
1. Click **"Create a tunnel"**
2. Choose **"Cloudflared"** tunnel type
3. Enter tunnel name: `vibecodementor` (or your preferred name)
4. Click **"Save tunnel"**

### **3. Get Your Tunnel Token**
1. On the next page, you'll see installation instructions
2. **Copy the entire token** from the command that looks like:
   ```bash
   cloudflared service install eyJhIjoiXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
   ```
3. **Save just the token part** (everything after `install `)

### **4. Configure Public Hostname (Important!)**
1. In the **"Public hostname"** tab:
2. **Subdomain:** Leave empty (for root domain) or enter `www`
3. **Domain:** Select your domain from dropdown
4. **Path:** Leave empty
5. **Service Type:** `HTTP`
6. **URL:** `localhost:80`
7. Click **"Save tunnel"**

### **5. Use Token in Setup Script**
- Run your setup script: `./scripts/setup-server.sh`
- Enter your server IP when prompted
- Enter your domain name when prompted  
- Choose "y" for Cloudflare Tunnel setup
- Paste your tunnel token when requested
- The script will handle the rest!

## 🔧 What the Script Does

1. **Installs cloudflared** on your server
2. **Configures the tunnel** using your token
3. **Sets up secure firewall** (only SSH exposed)
4. **Starts tunnel service** with auto-restart
5. **Verifies connection** is working

## ✅ Verification

After setup, your domain should be accessible at:
- `https://yourdomain.com` (automatically redirects to HTTPS)
- Server IP remains completely hidden
- Only SSH port is exposed on the server

## 🛡️ Security Benefits

- **Hidden IP Address** - Attackers can't discover your server
- **Zero Open Ports** - Only SSH exposed, everything else through tunnel
- **DDoS Protection** - Cloudflare handles all attacks
- **Automatic SSL** - No certificate management needed

## 🔧 Troubleshooting

### **Tunnel Not Working?**
```bash
# SSH to your server and check tunnel status
ssh root@YOUR_SERVER_IP
sudo systemctl status cloudflared

# Check tunnel logs
sudo journalctl -u cloudflared -f
```

### **Domain Not Accessible?**
1. Check if tunnel is running: `sudo systemctl status cloudflared`
2. Verify nginx is running: `docker ps`
3. Check Cloudflare dashboard for tunnel status

### **Need to Update Tunnel Config?**
```bash
# Stop tunnel
sudo systemctl stop cloudflared

# Reinstall with new token
cloudflared service install NEW_TOKEN_HERE

# Start tunnel
sudo systemctl start cloudflared
```

Perfect for keeping your VibeCodeMentor server secure! 🇸🇪 