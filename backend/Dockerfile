# Backend Production Dockerfile for kanpAI
FROM node:18-alpine AS base

# Install system dependencies needed for PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kanpai -u 1001

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/backups
RUN chown -R kanpai:nodejs /app

# Switch to non-root user
USER kanpai

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

EXPOSE 3002

CMD ["node", "src/server.js"]