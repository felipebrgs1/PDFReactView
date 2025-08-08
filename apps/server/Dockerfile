FROM oven/bun:slim AS base
WORKDIR /app

# Install dependencies with caching (workspace-aware)
FROM base AS deps
# Copy monorepo root manifests (workspace) and workspace manifests so Bun can
# resolve workspaces consistently with the root bun.lock.
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN --mount=type=cache,target=/root/.bun \
    bun install

# Development image
FROM base AS dev
ENV NODE_ENV=development
# Keep workspace install at /app so server can resolve hoisted deps
COPY --from=deps /app/node_modules /app/node_modules
# Copy only the server app into its workspace path
COPY apps/server /app/apps/server
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["bun", "src/index.ts"]

# Production image
FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY apps/server /app/apps/server
WORKDIR /app/apps/server
EXPOSE 3000
CMD ["bun", "run", "start"]
