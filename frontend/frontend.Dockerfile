# VibeCodeMentor Frontend Dockerfile
# Next.js standalone build for optimal production deployment

# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

# Copy package files and install all dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source code
COPY frontend/ .

# Build Next.js app in standalone mode
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Configure environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 