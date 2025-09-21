# Multi-process container: Next.js UI + Agent (Playwright) + Edge proxy on $PORT
# Uses Playwright base to include Chromium + deps
FROM mcr.microsoft.com/playwright:v1.54.2-jammy

ENV NODE_ENV=production \
    PORT=8080 \
    INTERACTIVE=0 \
    HEADLESS_BROWSER=true \
    BROWSER_ARGS=--no-sandbox,--disable-dev-shm-usage

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Build app
COPY . .
RUN SKIP_GEMINI_CHECK=1 pnpm build && pnpm prune --prod

# Cloud Run expects the app to listen on $PORT
EXPOSE 8080

CMD ["pnpm", "start"]
