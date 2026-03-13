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
CMD ["npm", "run", "start:dev"]


# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — builder (compile TypeScript)
# ──────────────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 4 — production (lean runtime image)
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main"]
