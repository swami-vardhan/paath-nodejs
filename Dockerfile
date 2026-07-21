# Divine Audio - Spiritual Audio Library
# Production Dockerfile

# Base image
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Install dependencies
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY src ./src/
COPY public ./public/
COPY next.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY components.json ./

RUN bun install --frozen-lockfile
RUN bun run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for database
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:./data/custom.db"

CMD ["node", "server.js"]
