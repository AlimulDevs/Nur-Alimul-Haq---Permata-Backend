# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — base dependencies
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — development
# ──────────────────────────────────────────────────────────────────────────────
FROM base AS development
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "start:dev"]


# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — builder (compile TypeScript + generate Prisma client)
# ──────────────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 4 — production (lean runtime image)
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Install prisma CLI separately (needed to run migrations at startup)
# Using the exact same version as devDependencies to match generated client
RUN npm install --no-save prisma@^6.0.0

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy Prisma schema + generated client artifacts (from builder, not reinstalled)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Entrypoint: run migrations then start the app
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
