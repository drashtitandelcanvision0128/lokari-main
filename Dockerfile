# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

# Build the frontend
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy frontend files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy backend files
COPY --from=builder --chown=nextjs:nodejs /app/backend ./backend
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules

USER nextjs

EXPOSE 3000
EXPOSE 5000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run Prisma migrations and start both servers
CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && cd .. && node server.js & cd backend && node src/server.js"]
