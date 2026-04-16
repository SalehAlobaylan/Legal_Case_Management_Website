# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1 — builder
#   Installs full deps (incl. devDependencies, needed by `next build`),
#   compiles the Next.js app, and emits a self-contained standalone server
#   into `.next/standalone/`.
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Tell Next.js build not to phone home.
ENV NEXT_TELEMETRY_DISABLED=1

# Install deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# NEXT_PUBLIC_* variables are inlined at build time. Set them via CranL
# build args so the compiled bundle points at the right API / WS / AI URLs.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_AI_SERVICE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_AI_SERVICE_URL=$NEXT_PUBLIC_AI_SERVICE_URL

COPY . .
RUN npm run build

# =============================================================================
# Stage 2 — runner
#   Minimal Node image running the standalone server produced above. No
#   `npm`, no devDependencies, runs as a non-root user.
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Run as non-root.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output is a fully self-contained server.js + the minimal
# node_modules it needs. `.next/static` and `public/` must be copied
# alongside it — they are deliberately not included by standalone.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3001
CMD ["node", "server.js"]
