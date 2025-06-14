# kanpAI Production Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Stage 3: Production image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kanpai -u 1001

# Set working directory
WORKDIR /app

# Copy backend files
COPY --from=backend-build --chown=kanpai:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=kanpai:nodejs /app/frontend/build ./frontend/build

# Create necessary directories
RUN mkdir -p /app/logs /app/backups && \
    chown -R kanpai:nodejs /app/logs /app/backups

# Switch to non-root user
USER kanpai

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Set working directory to backend for running the server
WORKDIR /app/backend

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/server.js"]