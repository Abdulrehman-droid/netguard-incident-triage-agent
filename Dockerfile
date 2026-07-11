# ─────────────────────────────────────────────────────────────
# NetGuard Incident Triage Agent
# Multi‑stage Docker build: Node → Vite → Nginx
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (copied separately for layer caching)
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
ARG VITE_FIREWORKS_API_KEY
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]