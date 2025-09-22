#!/bin/bash
set -euo pipefail
set -x

echo "--- Preparing Jules Environment for LionXA ---"

echo "--- Verifying Tool Versions ---"
node -v
pnpm -v
docker --version
docker compose version

echo "--- Ensuring .env exists and contains required keys ---"
if [ ! -f .env ]; then
  cp .env.example .env
fi
grep -q '^GEMINI_API_KEY=' .env || echo 'GEMINI_API_KEY=placeholder_for_build' >> .env
grep -q '^DRY_RUN=' .env || echo 'DRY_RUN=1' >> .env
grep -q '^VNC_PASSWORD=' .env || echo 'VNC_PASSWORD=jules_vnc_pass' >> .env

echo "--- Installing Node dependencies ---"
export CI=1
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
pnpm install --frozen-lockfile || pnpm install
pnpm approve-builds -w -y || true

echo "--- Building Docker images ---"
# Try docker without sudo; if it fails, try with sudo; otherwise skip docker phase
DOCKER_CMD=""
if docker info >/dev/null 2>&1; then
  DOCKER_CMD="docker"
elif command -v sudo >/dev/null 2>&1 && sudo -n docker info >/dev/null 2>&1; then
  DOCKER_CMD="sudo docker"
else
  echo "⚠️  Docker daemon not accessible (no permission). Skipping docker compose build."
fi

if [ -n "$DOCKER_CMD" ]; then
  $DOCKER_CMD compose build || echo "⚠️  Docker build failed; continuing with tests."
fi

echo "--- Running unit tests ---"
pnpm test

echo "--- Building Next.js (CI-safe) ---"
SKIP_GEMINI_CHECK=1 DRY_RUN=1 pnpm build || echo "⚠️  Next.js build failed; please review locally."

echo "--- Lint (non-blocking) ---"
pnpm lint || echo "⚠️  Lint failed; continuing."

echo "--- Jules setup script completed successfully! ---"
