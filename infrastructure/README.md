# VibeCodeMentor Infrastructure - Simple Docker Deployment

> Infrastructure as Code for DigitalOcean deployment with Docker

## 🚀 Quick Start

### Prerequisites
- DigitalOcean droplet (Ubuntu 22.04)
- Local Docker installed
- Node.js 18+ for development scripts
- SSH access to your server

### One-Time Setup

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Prepare your server:**
```bash
./scripts/setup-server.sh
```

3. **Setup environments:**
```bash
# For local development
npm run setup:local
# Edit .env.local with your development secrets

# For production deployment  
npm run setup:prod
# Edit .env with your production secrets
```

### Local Development

```bash
# Start everything (database + API)
npm run dev

# Or start everything including frontend
npm run dev:full

# Individual services
npm run start:db        # Just PostgreSQL
npm run start:api       # Just API (sources .env.local)
npm run start:frontend  # Just frontend
```

### Production Deployment

```bash
# 1. Setup production environment (once)
npm run setup:prod
# Edit .env with production secrets

# 2. Deploy
npm run build
npm run deploy
```

## 🔧 Environment Configuration

### **Single Configuration Approach**
We use **one `appsettings.json`** with environment variable references:

```json
{
  "Jwt": {
    "Key": "${JWT_SECRET_KEY}",
    "Issuer": "${JWT_ISSUER:vibecodementor}"
  }
}
```

- `${ENV_VAR}` = **Required** variable (app fails if missing)
- `${ENV_VAR:default}` = **Optional** variable with fallback

### **Environment Files (All in Project Root)**
- **`.env.template`** → Production deployment template
- **`.env.local.template`** → Local development template
- **`.env`** → Production secrets (not committed)
- **`.env.local`** → Local secrets (not committed)

### **Required Variables**
Reading `api/appsettings.json` shows you exactly what's needed:

**Secrets (no defaults):**
- `JWT_SECRET_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- `RESEND_API_TOKEN`, `RESEND_FROM_EMAIL`

**Optional (have defaults):**
- `DATABASE_URL`, `LOG_LEVEL`, `JWT_ISSUER`, etc.

## 📁 Project Structure

```
rapid-dev/
├── .env.template             # Production environment template
├── .env.local.template       # Local development template
├── .env                      # Production secrets (not committed)
├── .env.local                # Local secrets (not committed)
├── package.json              # Root npm scripts for development
├── api/
│   └── appsettings.json      # Single config with ${ENV_VAR} references
└── infrastructure/
    ├── docker-compose.prod.yml   # References ../.env
    ├── nginx/
    │   └── nginx.conf
    └── docker/
        └── nginx.Dockerfile
```

## 📦 NPM Scripts

### **Development:**
- `npm run dev` - Start database + API
- `npm run dev:full` - Start everything (DB + API + Frontend)
- `npm run start:api` - API only (uses .env.local)
- `npm run start:frontend` - Frontend only
- `npm run start:db` - PostgreSQL only

### **Environment Setup:**
- `npm run setup:local` - Copy .env.local.template
- `npm run setup:prod` - Copy .env.template

### **Building & Deployment:**
- `npm run build` - Build Docker images
- `npm run deploy <ip>` - Deploy to server

### **Testing:**
- `npm run test:api` - Run API tests

## 🔄 Development Workflow

### **First Time Setup:**
```bash
# 1. Install everything
npm run install:all

# 2. Setup local environment
npm run setup:local
# Edit .env.local with your secrets

# 3. Start development
npm run dev:full
```

### **Daily Development:**
```bash
npm run dev        # API development
npm run dev:full   # Full-stack development
```

### **Production Deployment:**
```bash
# 1. Setup production environment (once)
npm run setup:prod
# Edit .env with production secrets

# 2. Deploy
npm run build
npm run deploy
```

## 🌐 Architecture

```
Cloudflare → Nginx → Next.js + .NET API
                   ↓
               Supabase
```

**Environment Strategy:**
- **Dev:** `.env.local` + localhost database + npm scripts
- **Prod:** `.env` + Supabase database + Docker
- **Config:** Single `appsettings.json` with proper .NET env var override

**Key Features:**
- ✅ Single `appsettings.json` with clear defaults
- ✅ Root-level environment files (industry standard)
- ✅ npm scripts for developer experience
- ✅ dotenv-cli for environment sourcing
- ✅ Docker orchestration with `env_file`
- ✅ Host metrics volume mounts
- ✅ Interactive setup with Cloudflare Tunnel support
- ✅ Security: no secrets in git

Simple, secure, and developer-friendly! 🇸🇪