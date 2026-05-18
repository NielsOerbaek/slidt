# Single-stage bookworm build so playwright --with-deps works without extra apt passes.
FROM node:22-bookworm

WORKDIR /app

# pnpm via corepack — pin to same version used locally to avoid pnpm 11 breakage
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Install Node dependencies first (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Install Playwright's Chromium + all system dependencies it needs
RUN pnpm exec playwright install chromium --with-deps

# Copy source and build the SvelteKit app
COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Run migrations + seed (both idempotent) then start the built Node server.
ENTRYPOINT ["sh", "-c", "pnpm db:migrate && pnpm db:seed && node build"]
