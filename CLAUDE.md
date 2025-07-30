# Rapid-Dev Project

## 🎯 Architecture Philosophy: PRAGMATIC FIRST
**Optimize for AI Code Generation Speed and Reliability**
- **Speed over purity** - Ship working features, refactor later
- **Simple over clever** - Boring code is maintainable code
- **Consistent patterns** - AI can predict and repeat
- **Avoid over-engineering** - YAGNI (You Aren't Gonna Need It)

## 🏗️ Vertical Slice Architecture
**Both Frontend + Backend use feature slices (but cross-imports OK)**
```
frontend/src/features/     # React feature slices (can import each other)
api/Source/Features/       # .NET feature slices (MediatR patterns)
```

## 🔧 Technology Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Orval
- **Backend**: .NET 9 + ASP.NET Core + MediatR + EF Core
- **Database**: PostgreSQL with Code First migrations
- **Auth**: ASP.NET Core Identity + JWT + OTP via Resend
- **Real-time**: SignalR for live updates
- **Jobs**: Hangfire (background processing)
- **Storage**: Cloudflare R2 for files

## 🔄 API Integration Flow - CRITICAL
1. Backend updates .NET controllers/models
2. Swagger spec auto-generated at `/swagger/v1/swagger.json`
3. Frontend runs `npm run api:generate` (Orval)
4. TypeScript hooks/DTOs generated (NEVER EDIT THESE)
5. Features wrap generated code with business logic

## 🚀 Development Workflow

### Backend First (Always)
1. Create feature slice in `api/Source/Features/[Feature]/`
2. Add Commands, Queries, Models via MediatR
3. EF migrations: `dotnet ef migrations add [Name]`
4. Swagger updates automatically

### Then Frontend
1. Run `npm run api:generate` (regenerates TypeScript)
2. Create feature slice in `frontend/src/features/[feature]/`
3. Wrap generated hooks with business logic
4. Build UI components

## 🎯 Key Principles
- ✅ Features CAN cross-import (be pragmatic, not dogmatic)
- ✅ Domain events for async cross-feature communication
- ✅ Generated code is NEVER edited manually
- ✅ Type safety end-to-end (.NET → TypeScript via Swagger)
- ✅ Real-time updates via SignalR + React Query cache invalidation
- ✅ Ship fast, optimize later

## 🚨 Critical Things to Remember
- **Orval wipes `api/` folder** - wrap generated hooks, don't edit
- **EF migrations** - always test locally before deploy
- **JWT expiry** - handle 401s gracefully in frontend
- **SignalR cleanup** - useEffect cleanup for connections
- **Background jobs** - use for heavy operations, not blocking requests
- **CORS** - Next.js proxy handles this (`/api/*` → backend)

## 📁 Project Structure
```
rapid-dev/
├── frontend/          # Next.js app
├── api/               # .NET 9 backend  
├── infrastructure/    # Docker configs
└── docs/              # Setup guides (Cloudflare, Resend, etc.)
```

## 🔄 Common Patterns

### Adding New Feature
1. **Backend**: Feature folder + Commands/Queries + Controller
2. **Database**: EF migration if needed
3. **Frontend**: `npm run api:generate` + feature slice + UI

### File Upload Flow
1. Frontend requests presigned URL from Cloudflare R2
2. Direct upload to R2 (bypasses backend)
3. Frontend notifies backend of upload completion
4. Backend processes file, triggers domain events

### Real-time Updates
1. Backend operation triggers domain event
2. SignalR hub sends update to connected clients
3. Frontend React Query cache invalidation
4. UI automatically re-renders with fresh data

## 🔐 Authentication Pattern
- ASP.NET Core Identity manages users + OTP tokens
- OTP sent via Resend email service 
- JWT tokens for API authentication
- Frontend stores JWT in localStorage
- Axios interceptors add `Authorization: Bearer {token}`
- SignalR uses same JWT for real-time auth

## 🛠️ Development Commands

### Backend
```bash
# Run backend
cd api && dotnet run

# Add migration
cd api && dotnet ef migrations add [Name]

# Update database
cd api && dotnet ef database update

# Run tests
cd api.Tests && dotnet test
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Run dev server
cd frontend && npm run dev

# Regenerate API types
cd frontend && npm run api:generate

# Build
cd frontend && npm run build
```

### Full Stack
```bash
# Run everything with Docker
docker-compose up

# Production build
docker-compose -f infrastructure/docker-compose.prod.yml up
```

## 🎯 AI Development Tips
- Always check existing patterns before creating new ones
- Use feature slices for organization
- Wrap generated API hooks with business logic
- Follow the pragmatic-first philosophy
- Ship fast, refactor later
- Keep it simple and consistent