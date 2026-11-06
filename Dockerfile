# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ---- build: all dependencies, generated Prisma client, compiled app ----
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app

# OpenSSL is installed here only: this stage also runs the migrations
# (the migrate service). The runtime stage does not need it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# "prebuild" runs `prisma generate` before `nest build`
RUN npm run build

# ---- prod-deps: production dependencies only ----
FROM node:${NODE_VERSION}-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime: minimal image, non-root ----
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 3005

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3005) + '/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"]

# Run node directly (not through npm) so SIGTERM reaches the app
CMD ["node", "dist/main"]