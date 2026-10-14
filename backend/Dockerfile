# Backend Dockerfile — Module 1: Containerization
# Multi-stage build: install deps, build TypeScript, run compiled output

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npx prisma generate

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Create directories for uploads and database
RUN mkdir -p uploads && chown node:node uploads

# Run as non-root user (Module 4: Security)
USER node

EXPOSE 3001

# Run database push then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
