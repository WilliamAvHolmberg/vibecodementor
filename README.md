# VibeCodeMentor - AI-Driven Development Platform

> **Fast-track AI development** with .NET 9 + Next.js 15 starter optimized for **vertical slice architecture** and rapid prototyping.

🌐 **[Live Demo: vibecodementor.net](https://vibecodementor.net)**

## 🤖 Why This Stack?

**Built for AI-driven development:**
- **Vertical Slice Architecture** - Features are self-contained (frontend + backend)
- **Type-safe API** - Auto-generated from OpenAPI/Swagger
- **Real-time Everything** - SignalR for live updates
- **Instant Deploy** - Docker + scripts for one-command deployment

Perfect for building AI prototypes, chat apps, and data-driven applications.

## ⚡ Quick Start (3 commands)

```bash
# 1. Setup environment
npm run install:all
npm run setup:local
# Edit .env.local with your database/secrets

# 2. Start development
npm run start:db        # Start PostgreSQL
npm run start:api       # Start .NET API (localhost:5001)
npm run start:frontend  # Start Next.js (localhost:3000)
```

**That's it!** Visit http://localhost:3000

## 🏗️ Architecture

### **Tech Stack**
- **Backend:** .NET 9 + Entity Framework + SignalR
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS + TypeScript  
- **Database:** PostgreSQL
- **Deployment:** Docker + nginx

### **Vertical Slice Pattern**
Each feature is a complete slice (UI + API + DB):

```
📁 Frontend: features/chat/     📁 Backend: Features/Chat/
├── components/                 ├── Commands/
├── hooks/                      ├── Queries/  
├── types.ts                    ├── Models/
└── index.ts                    └── Controllers/
```

**Benefits:** Faster development, easier testing, cleaner code organization.

## 🚀 Production Deployment

### **1. Server Setup (Interactive)**
```bash
./scripts/setup-server.sh
# Prompts for: server IP, domain, Cloudflare tunnel setup
```

### **2. Deploy Application**
```bash
npm run setup:prod  # Creates .env file
# Edit .env with production secrets

npm run build       # Build Docker images
npm run deploy      # Deploy (prompts for server IP)
```

**Done!** Your app is live with SSL, nginx, and Cloudflare tunnel protection.

## 📦 Key Features

- **🤖 AI-Ready:** Real-time chat, file uploads, analytics dashboard
- **🔐 Auth System:** OTP email authentication  
- **📊 Live Metrics:** Server monitoring with SignalR
- **☁️ File Storage:** Cloudflare R2 integration
- **🛡️ Security:** Environment validation, secret management
- **🐳 DevOps:** One-command Docker deployment

## 🔧 Development Commands

```bash
# Environment setup
npm run setup:local     # Create .env.local
npm run setup:prod      # Create .env

# Development
npm run start:db        # PostgreSQL only
npm run start:api       # .NET API only
npm run start:frontend  # Next.js only

# Testing
cd api.Tests && dotnet test  # Run API tests

# Production
npm run build           # Build Docker images  
npm run deploy          # Deploy to server
```

## 📁 Project Structure

```
rapid-dev/
├── 🔧 api/                    # .NET 9 Backend
│   └── Source/Features/       # Vertical slices (Auth, Chat, Users)
├── 🎨 frontend/               # Next.js 15 Frontend
│   └── src/features/          # Vertical slices (auth, chat, dashboard)
├── 🐳 infrastructure/         # Docker + nginx configs
├── 📜 scripts/                # Setup and deploy scripts
└── 📋 package.json            # Development commands
```

## 🔥 What Makes This Special

1. **AI-Optimized:** Built for chat apps, real-time data, file processing
2. **Vertical Slices:** Each feature is self-contained and easy to modify  
3. **Type Safety:** Full-stack TypeScript with auto-generated API types
4. **Real-time First:** SignalR for live updates across the entire app
5. **Deploy in Minutes:** Complete Docker deployment with one command

## 📚 Next Steps

- **AI Integration:** Add OpenAI/Claude API for chat features
- **Database:** Customize PostgreSQL schemas for your use case  
- **UI Components:** Extend the shadcn/ui component library
- **Authentication:** Configure email provider (Resend) for OTP

**Perfect for:** AI prototypes, chat applications, real-time dashboards, SaaS MVPs

Built with ❤️ for rapid AI development! 🇸🇪